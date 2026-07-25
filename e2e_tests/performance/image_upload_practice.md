# Prueba de Rendimiento: Subida de Imágenes Simultáneas (Backblaze B2)

## 1. ¿Qué es la práctica y de qué trata?
El objetivo de esta prueba es evaluar el rendimiento de la red y el consumo de RAM del servidor FastAPI cuando múltiples usuarios intentan subir imágenes pesadas (multipart/form-data) al mismo tiempo hacia el almacenamiento en la nube (Backblaze B2) mediante el endpoint `/backblaze/upload`.

## 2. Requisitos Previos
- Contenedores Docker (API, DB, Redis) ejecutándose.
- Entorno virtual de Python configurado en `backend/.venv`.
- El script k6 leerá automáticamente el archivo `dummy_pet.jpg` desde la carpeta `e2e_tests/functional`.

## 3. Pasos de Ejecución

### Paso 1: Generar Token de Administrador
Este endpoint está protegido por RBAC y requiere privilegios de Administrador. Ejecuta el script de Python para generar un token válido temporal:
```powershell
..\..\backend\.venv\Scripts\python.exe generate_admin_token.py
```
Esto creará el archivo `admin_token.json`. 

### Paso 2: Ejecutar la prueba de Carga de Imágenes
Inyectaremos ráfagas de subida de archivos (escalando hasta 20 subidas por segundo concurrentes). Ejecuta:
```powershell
docker run --rm -i -v ${PWD}:/ci -v ${PWD}/../functional:/functional -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/image_upload_load.js
```
*(Nota: Añadimos el volumen `-v ${PWD}/../functional:/functional` para que K6 encuentre la imagen de prueba).*

### Paso 3: Tomar Evidencias y Análisis
1. **Evidencia K6**: Al finalizar, toma una captura de la consola con los resultados. Presta especial atención al `data_sent` y al `http_req_duration`. Guárdala como `e2e_tests/screenshots/k6_image_upload_results.png`.
2. **Evidencia de Consumo**: En **Dozzle** (`http://localhost:8080`), revisa las Métricas de `smart-adopt-backend-dev` (RAM/CPU) y toma captura para ver si el procesamiento de archivos multimedia disparó el consumo. Guárdala como `e2e_tests/screenshots/backend_metrics_upload.png`.

## 4. Análisis de Resultados (Hallazgos Críticos)
Durante la implementación inicial de esta prueba, se detectó un **cuello de botella de Entrada/Salida (I/O)** muy severo:
- El 100% de las solicitudes alcanzaron el tiempo máximo de espera de K6 (60 segundos) generando errores de `request timeout`.
- K6 lograba transferir los datos (bytes enviados), pero no recibía respuesta alguna (0 bytes recibidos).
- **Diagnóstico:** El endpoint bloquea completamente el hilo (Event Loop) de FastAPI de manera síncrona mientras se espera la respuesta de Backblaze, paralizando el servidor ante conexiones múltiples. Es un punto crítico de optimización que requiere ser refactorizado hacia un enfoque asíncrono (`async`).
