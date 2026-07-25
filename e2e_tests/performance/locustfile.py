import json
import os
from locust import HttpUser, task, between

class MemoryLeakUser(HttpUser):
    # Simula un tiempo de espera muy corto (0.5 a 2 segundos) entre peticiones
    # para generar una carga masiva y forzar la asignacion de memoria.
    wait_time = between(0.5, 2)
    
    def on_start(self):
        """
        Lee el token de admin al iniciar el usuario (se usa el mismo que generamos con python)
        """
        token_path = os.path.join(os.path.dirname(__file__), "admin_token.json")
        self.headers = {"Content-Type": "application/json"}
        
        if os.path.exists(token_path):
            with open(token_path, "r") as f:
                data = json.load(f)
                token = data.get("access_token")
                if token:
                    self.headers["Authorization"] = f"Bearer {token}"
                else:
                    print("ADVERTENCIA: No se encontró access_token en admin_token.json")
        else:
            print(f"ADVERTENCIA: No se encontró {token_path}. Ejecuta generate_admin_token.py primero.")

    @task(3)
    def fetch_all_pets(self):
        """
        Pide la lista de mascotas completa. Esto instancia muchos diccionarios 
        en la memoria de Python (Pydantic models, JSON serialization).
        """
        with self.client.get("/pets/", headers=self.headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Fallo al pedir mascotas: {response.status_code}")

    @task(1)
    def fetch_admin_dashboard(self):
        """
        Pide métricas del dashboard (8 consultas a DB simultaneas).
        Fuerza al driver de MongoDB y al Event Loop de FastAPI a abrir/cerrar recursos.
        """
        with self.client.get("/admin/dashboard", headers=self.headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Token expirado (401). ¡Refresca el token de admin!")
            else:
                response.failure(f"Fallo en dashboard: {response.status_code}")
