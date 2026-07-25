# SmartAdopt End-to-End Tests

## Prueba de Funcionalidad: Flujo de Aprobación de Adopción (Admin y Adopter)

Para ejecutar esta prueba automatizada, utiliza el siguiente comando en la raíz del proyecto (o ingresando a esta carpeta):

```bash
python e2e_tests/functional/test_adoption_flow.py
```

## Prueba de Seguridad: Control de Acceso (RBAC)

Esta prueba valida que un usuario con privilegios de `Adopter` sea bloqueado al intentar acceder a rutas protegidas de `Administrador` (ej. `/admin/pets/new`).

```bash
python e2e_tests/functional/test_rbac_access.py
```

## Prueba de Inteligencia Artificial: Generación de Descripciones (BLIP + LLM)

Esta prueba valida el flujo de creación de mascotas y la integración del backend con los modelos de IA (BLIP para entendimiento de imagen y Llama 3 para texto). Sube una imagen, espera el procesamiento y además verifica que el botón `Regenerar Textos con IA` en el panel de detalles ejecute el autocompletado en tiempo real sin fallos.

```bash
python e2e_tests/functional/test_ai_generation.py
```

## Prueba de Experiencia de Usuario: Sincronización de Favoritos

Valida que el sistema de Favoritos (estilo Tinder) persista correctamente y se sincronice bidireccionalmente al usar múltiples pestañas o dispositivos mediante el token de sesión.

```bash
python e2e_tests/functional/test_favorites_sync.py
```

## Prueba de Manejo de Errores y Validaciones (Zod/Frontend)

Valida que el formulario de Registro bloquee envíos incompletos, emails malformados y entradas con caracteres especiales maliciosos (XSS preventivo) mostrando mensajes de error amigables.

```bash
python e2e_tests/functional/test_form_validation.py
```

## Pruebas de Rendimiento (Performance Testing)

### Escenario 1: Tormenta de Refresco JWT (k6)
Valida la robustez del servidor y de Redis cuando miles de usuarios simultáneos intentan refrescar sus tokens caducados. Utiliza `k6` para inyectar una gran cantidad de solicitudes (`/auth/refresh`) por segundo.

Para ejecutarla, dirígete a la carpeta `performance/` e inicia la prueba en Docker:
```powershell
cd e2e_tests/performance
# Generar los tokens primero:
..\..\backend\.venv\Scripts\python.exe generate_tokens.py
# Ejecutar K6:
docker run --rm -i -v ${PWD}:/ci -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/refresh_token_load.js
```

### Escenario 2: Subida de Imágenes a Backblaze (k6)
Valida el comportamiento de la red y descubre cuellos de botella síncronos en el Event Loop de FastAPI al transferir archivos simultáneos hacia el almacenamiento en la nube.

Para ejecutarla:
```powershell
cd e2e_tests/performance
# Generar el token de administrador primero:
..\..\backend\.venv\Scripts\python.exe generate_admin_token.py
# Ejecutar K6 inyectando el volumen extra con la imagen funcional:
docker run --rm -i -v ${PWD}:/ci -v ${PWD}/../functional:/functional -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/image_upload_load.js
```

### Escenario 3: Integración con IA y Limites de Cuota (k6)
Valida el tiempo de procesamiento y la resiliencia del servidor cuando se le pide a la IA generar descripciones de forma concurrente, provocando posibles caídas o errores de límite de cuota (Rate Limits 429) por parte de Groq/LLM.

Para ejecutarla:
```powershell
cd e2e_tests/performance
# Asume que ya existe un admin_token.json y al menos una mascota registrada
docker run --rm -i -v ${PWD}:/ci -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/ai_generation_load.js
```

### Escenario 4: Consultas Complejas del Dashboard Admin (k6)
Valida el tiempo de respuesta y la eficiencia de la base de datos (MongoDB) y el backend al procesar múltiples consultas simultáneas de agregación y conteo de métricas en el panel de control del administrador.

Para ejecutarla:
```powershell
cd e2e_tests/performance
# Refresca el token si hace falta:
# ..\..\backend\.venv\Scripts\python.exe generate_admin_token.py
docker run --rm -i -v ${PWD}:/ci -e BASE_URL=http://host.docker.internal:8000 grafana/k6 run /ci/dashboard_metrics_load.js
```

### Escenario 5: Mini-Soak Test para Fugas de Memoria (Locust)
Introduce **Locust** (Python) para someter al sistema a una carga agresiva e iterativa combinando consultas a base de datos y obtención de largas listas de datos para disparar el consumo de memoria RAM. Sirve para validar que no haya *Memory Leaks* y que el GC de Python limpie la memoria al finalizar.

Para ejecutarla (modo headless durante un tiempo, luego detener con Ctrl+C):
```powershell
cd e2e_tests/performance
# Asume que ya tienes instalado locust en backend/.venv
..\..\backend\.venv\Scripts\locust.exe -f locustfile.py MemoryLeakUser --headless -u 50 -r 5 --host=http://localhost:8000
```

Lee el [`performance/README.md`](file:///c:/GitHub/SmartAdoptApp/e2e_tests/performance/README.md) y sus prácticas detalladas para más información.

*Nota: Asegúrate de tener instalado Selenium (`pip install selenium`). Las capturas de pantalla de la ejecución y de posibles errores se guardarán automáticamente en la carpeta `screenshots/` la cual es ignorada por Git.*
