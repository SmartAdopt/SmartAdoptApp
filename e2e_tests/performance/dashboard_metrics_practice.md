# Prueba de Rendimiento: Consultas Complejas del Dashboard Admin

## 1. ¿Qué es la práctica y de qué trata?
Esta prueba de carga se centra en validar cómo la aplicación y sus bases de datos (MongoDB en este caso) manejan peticiones masivas que requieren cálculos o agrupaciones de múltiples colecciones (como métricas y estadísticas consolidadas). 
Para esto, atacaremos masivamente el endpoint `GET /admin/dashboard`.

Esta prueba busca identificar:
- **Tiempos de latencia** de la base de datos bajo estrés de lectura.
- **Cuellos de botella** en la paralelización de operaciones de bases de datos. A diferencia de las pruebas anteriores, estas operaciones están optimizadas con llamadas asíncronas (`await motor_collection.count_documents(...)`), pero un exceso de conexiones puede saturar el Pool de MongoDB o la CPU.

## 2. Requisitos Previos
- Contenedores Docker (API, MongoDB) ejecutándose.
- Entorno virtual de Python configurado en `backend/.venv`.
- El archivo de token `admin_token.json` debe estar generado y **válido** (no más de 1 hora de antigüedad).

## 3. Pasos de Ejecución

### Paso 1: Asegurarse de tener un Token Fresco
Si ha pasado mucho tiempo desde la última prueba, el token puede haber expirado y K6 será bloqueado con un `401 Unauthorized`. Ejecuta el script de Python para refrescarlo:
```powershell
..\..\backend\.venv\Scripts\python.exe generate_admin_token.py
```

### Paso 2: Ejecutar la prueba de carga del Dashboard
Simularemos a decenas de administradores entrando simultáneamente al panel de control de la fundación:
```powershell
docker run --rm -i -v ${PWD}:/ci -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/dashboard_metrics_load.js
```

### Paso 3: Tomar Evidencias y Análisis
1. **Evidencia K6**: Toma una captura de la consola al finalizar la prueba. K6 marcará si se cruzan los umbrales configurados (`http_req_duration < 1500ms`). Guárdala como `e2e_tests/screenshots/k6_dashboard_results.png`.
2. **Evidencia de Consumo (Dozzle)**: Entra a Dozzle (`http://localhost:8080`) y revisa los logs del contenedor de la base de datos (`smart-adopt-mongodb-dev`). Podrás ver si la base de datos lanza advertencias de "demasiadas conexiones" o si los tiempos de respuesta de consulta se elevan. Toma captura y guárdala como `e2e_tests/screenshots/mongo_db_stress.png`.

## 4. Criterios de Éxito de la Prueba
A diferencia del test de IA o almacenamiento en nube, en este caso las consultas a la base de datos local son mucho más rápidas y el backend de FastAPI usa el cliente de base de datos asíncrono (`motor`). 
El éxito radica en que el servidor **pueda mantener tiempos de respuesta bajos (menos de 1 segundo)** y no devuelva errores 500 de Timeouts de base de datos. Si todo está bien configurado, es probable que la prueba sea un `ÉXITO` verde en K6.
