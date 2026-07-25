# Pruebas de Manejo de Errores y Validaciones Preventivas (Zod)

## 1. ¿Qué es la práctica y de qué trata?
La automatización de **Manejo de Errores y Validaciones** busca certificar que un sistema interactivo proteja sus endpoints rebotando peticiones anómalas desde el cliente. En aplicaciones modernas (SPA), esquemas robustos como *Zod* interceptan entradas antes de que viajen por la red. La prueba fuerza a la aplicación a enfrentarse a escenarios dañinos (Inyecciones, vacíos, emails falsos) comprobando que las interfaces respondan con mensajes de error amigables. 

Se empleó el **Formulario de Registro de Usuario** por ser la barrera principal que captura cadenas críticas de texto como Nombres, Emails y Contraseñas, abarcando todas las áreas clave mencionadas (datos incompletos, emails inválidos y caracteres especiales).

## 2. Aspectos más importantes
- **Bloqueo Pre-flight (Frontend First):** La prueba debe confirmar que al intentar el envío anómalo, la URL no cambia ni el formulario avanza. El bloqueo se da estrictamente en el cliente ahorrando recursos del servidor.
- **Validación de Expresiones Regulares (Regex):** Una parte de la prueba inyecta payloads estilo XSS (ej. `<img src=x onerror=alert(1)>`) en campos diseñados solo para texto natural. Si el schema está bien configurado, la inyección ni siquiera llega al backend.
- **Asistencia UX/UI:** Tan importante como bloquear la petición, es que el HelperText que arroja Zod sea claro (ej: *"Solo se permiten letras y espacios"*).

## 3. Herramientas Utilizadas y Enfoque Técnico
- **Selenium WebDriver (Inyección de Payloads):**
  - Se utilizan múltiples comandos `send_keys` concatenados con interacciones al botón `submit` simulando a un usuario o bot llenando el formulario torpemente o con malas intenciones.
  - Para encontrar los mensajes de error dinámicos inyectados por Material UI y Zod, se usa XPath evaluando el texto renderizado asíncronamente: `wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Correo electrónico no válido')]")))`.

## 4. Breve Análisis de los Resultados Esperados
**Flujo automatizado:**
El script navega a `#/register` e intenta enviar la petición vacía (validando campos requeridos). Luego inyecta un correo destructivo y XSS confirmando que la UI avise que son inválidos. Finalmente intenta una contraseña ultra-corta para evaluar el medidor de fuerza.

**Resultados esperados:**
- **Robustez de Zod comprobada:** El script podrá certificar que ninguna de las 4 peticiones malintencionadas logró enviar la petición POST al backend (el código no entró al bloque `try` de Axios/fetch).
- **Consistencia Visual:** Los `TextFields` reaccionan mostrando helper-texts en rojo, certificando que los *endpoints* están a salvo del mal uso directo desde el cliente.
