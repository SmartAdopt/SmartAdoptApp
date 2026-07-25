# Prueba de Rendimiento: Integración con IA (BLIP + LLM)

## 1. ¿Qué es la práctica y de qué trata?
El objetivo de esta prueba es evaluar el tiempo de procesamiento y la resiliencia del backend ante la generación concurrente de descripciones por Inteligencia Artificial. La prueba bombardeará el endpoint `/pets/{profile_id}/regenerate`, obligando al servidor a procesar imágenes a través de **BLIP** y solicitar enriquecimientos de texto a **Groq (Llama 3)** de forma masiva.

Esta prueba busca identificar:
- **Tiempos de latencia** de llamadas externas a la IA.
- **Cuellos de botella** en la paralelización del backend.
- **Límites de Cuota (Rate Limits)** del proveedor Groq (HTTP 429 Too Many Requests).

## 2. Requisitos Previos
- Contenedores Docker (API, DB, Redis) ejecutándose.
- Entorno virtual de Python configurado en `backend/.venv`.
- **Es necesario tener al menos una mascota registrada en la base de datos**. Si la base de datos está vacía, ejecuta primero la prueba funcional de adopción o creación de mascotas (`python e2e_tests/functional/test_ai_generation.py`).

## 3. Pasos de Ejecución

### Paso 1: Generar Token de Administrador
El endpoint de regeneración por IA está protegido y requiere permisos de Administrador. Ejecuta el script de Python para generar un token válido temporal:
```powershell
..\..\backend\.venv\Scripts\python.exe generate_admin_token.py
```
*(Esto reutilizará el archivo `admin_token.json`)*.

### Paso 2: Ejecutar la prueba de Estrés a la IA
Inyectaremos tráfico simulando a varios usuarios regenerando perfiles. Ejecuta:
```powershell
docker run --rm -i -v ${PWD}:/ci -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/ai_generation_load.js
```

### Paso 3: Tomar Evidencias y Análisis
1. **Evidencia K6**: Al finalizar, toma una captura de la consola con los resultados. Notarás comprobaciones especiales como `status is 429 (Rate Limit Groq)`. Guárdala como `e2e_tests/screenshots/k6_ai_generation_results.png`.
2. **Evidencia de Consumo**: La regeneración con IA suele ser pesada para la CPU o puede generar Timeouts por llamadas externas. En **Dozzle** (`http://localhost:8080`), busca errores de cuota de API (Groq) en el contenedor `smart-adopt-backend-dev` y toma captura. Guárdala como `e2e_tests/screenshots/backend_ai_errors.png`.

## 4. Criterios de Éxito de la Prueba
A diferencia de otras pruebas, en integraciones externas con APIs gratuitas (como Groq), **es totalmente esperado fallar por Rate Limit**. 
El éxito radica en verificar que el backend "caiga con gracia", es decir, que arroje el error adecuadamente (o devuelva un 429/500 manejable) **sin colapsar la aplicación completa ni apagar el servidor FastAPI**.
