# Pruebas de Rendimiento (Performance Testing)

Este directorio contiene los scripts y la configuración necesarios para ejecutar pruebas de carga y estrés sobre la API de SmartAdopt, utilizando **k6**.

Aquí puedes encontrar la documentación detallada de cada escenario de prueba:

- [Escenario 1: Tormenta de Refresco de Tokens (JWT Refresh Storm)](file:///c:/GitHub/SmartAdoptApp/e2e_tests/performance/refresh_storm_practice.md)
  Valida la robustez del servidor de Redis y el backend ante la re-autenticación masiva.

- [Escenario 2: Subida de Imágenes Simultáneas (Backblaze B2)](file:///c:/GitHub/SmartAdoptApp/e2e_tests/performance/image_upload_practice.md)
  Valida el comportamiento de la red y cuellos de botella síncronos al transferir archivos hacia la nube.

- [Escenario 3: Integración con IA (BLIP + LLM Rate Limits)](file:///c:/GitHub/SmartAdoptApp/e2e_tests/performance/ai_generation_practice.md)
  Valida el tiempo de procesamiento y los cuellos de botella al pedirle a la Inteligencia Artificial que genere descripciones recurrentes, forzando y evaluando la reacción del servidor ante los límites de cuota (Rate Limits) del proveedor.

- [Escenario 4: Consultas Complejas del Dashboard Admin (Base de Datos)](file:///c:/GitHub/SmartAdoptApp/e2e_tests/performance/dashboard_metrics_practice.md)
  Valida el tiempo de respuesta y la eficiencia del backend y la base de datos (MongoDB) al procesar múltiples consultas simultáneas de agregación y métricas.

- [Escenario 5: Mini-Soak Test para Memory Leaks (Locust)](file:///c:/GitHub/SmartAdoptApp/e2e_tests/performance/memory_leak_practice.md)
  Utiliza Locust para mantener una carga pesada y prolongada (3-5 minutos o más) y monitorear mediante Dozzle si la memoria del servidor se libera correctamente o si existen fugas de memoria y conexiones estancadas.
