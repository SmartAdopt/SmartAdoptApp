# Prueba de Rendimiento: Tormenta de Refresco JWT (Refresh Storm)

## 1. ¿Qué es la práctica y de qué trata?
El objetivo de esta prueba es evaluar el impacto en el backend y especialmente en el servidor de **Redis** cuando miles de usuarios intentan refrescar su token de acceso (`/auth/refresh`) simultáneamente. Esto simula un escenario de alta concurrencia donde los tokens de una sesión masiva caducan al mismo tiempo.

## 2. Requisitos Previos
- Tener el backend y los servicios (Redis, Postgres) corriendo localmente mediante `docker-compose`.
- Tener **Docker** instalado para ejecutar la prueba de k6 sin necesidad de instalarlo en el host.
- Python (el entorno virtual del backend) para generar los tokens iniciales de prueba.

## 3. Pasos de Ejecución

### Paso 1: Generar Tokens de Prueba
Antes de lanzar la prueba, necesitamos generar miles de tokens JWT (access_token caducado y refresh_token válido) y guardarlos en un archivo para que k6 los consuma. Esto simula miles de usuarios con sesiones activas que necesitan un nuevo token.

Desde la carpeta `e2e_tests/performance`, ejecuta el script de Python utilizando el entorno virtual del backend:
```powershell
..\..\backend\.venv\Scripts\python.exe generate_tokens.py
```
Esto creará un archivo `test_tokens.json` con 5000 pares de tokens válidos.

### Paso 2: Ejecutar la prueba de k6
Ejecuta el siguiente comando Docker para lanzar la prueba de estrés utilizando la imagen oficial de `grafana/k6`:
```powershell
docker run --rm -i -v ${PWD}:/ci -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/refresh_token_load.js
```

### Paso 3: Tomar Evidencias (Screenshots)
1. **Consola K6**: Toma una captura de pantalla del resumen detallado que k6 imprime al finalizar (tiempo de respuesta p(95), RPS, etc.). Guárdala como `e2e_tests/screenshots/k6_refresh_storm_results.png`.
2. **Dozzle (Logs)**: Abre la interfaz de Dozzle (`http://localhost:8080`) y toma captura de los picos de logs/uso del contenedor de Redis o del backend. Guárdala como `e2e_tests/screenshots/redis_logs_storm.png`.

## 4. Criterios de Éxito de la Prueba
- `http_req_duration`: El 95% de las solicitudes deben completarse en menos de 1000ms.
- `http_req_failed`: La tasa de error debe ser menor al 1%.
- Redis no debe colapsar bajo la alta concurrencia de comprobación de la "lista negra".
