# Solución al problema del Refresh Token

## Análisis del problema

Al revisar el funcionamiento del frontend y compararlo con la lógica de autenticación del backend, descubrí por qué el flujo del *refresh token* estaba fallando. El problema principal residía en cómo el frontend manejaba el token en comparación a cómo el backend lo esperaba.

1. **El backend utiliza cookies HTTP-Only para el refresh token:** Por razones de seguridad (para mitigar ataques XSS), el backend configura y espera recibir el `refresh_token` a través de una cookie marcada como `httponly=True`.
2. **El frontend buscaba el token en LocalStorage:** El interceptor de Axios en el frontend (`apiClient.ts`) estaba intentando leer el `refresh_token` haciendo uso de `localStorage.getItem("refresh_token")`. Como las cookies HTTP-Only son invisibles e inaccesibles para el código JavaScript, el valor siempre era nulo tras un inicio de sesión estándar. Al no encontrarlo, el frontend cerraba la sesión del usuario **inmediatamente** cuando el *access token* caducaba, sin siquiera enviar la solicitud de refresco al backend.
3. **Falta de envío de credenciales en la petición:** Cuando el frontend intentaba hacer la petición a `/auth/refresh`, lo hacía usando `axios.post` sin especificar `{ withCredentials: true }`. Esta bandera es obligatoria en Axios para que el navegador adjunte las cookies en peticiones Cross-Origin (CORS). Sin ella, el backend nunca recibía la cookie y siempre fallaba la autenticación de refresco.
4. **Condicionales estrictos de mensajes de error:** El frontend solo intentaba el refresco si el mensaje de error era textualmente `"Token expired"` o `"Could not validate credentials"`. Esto era frágil y propenso a romper el flujo si el backend retornaba algún otro mensaje para un error HTTP 401.

## Solución implementada

De acuerdo a tus instrucciones, no toqué el código del backend, centrando todas mis modificaciones estrictamente en los archivos del **frontend**.

1. **Modificación del Interceptor en `src/services/apiClient.ts`**:
   - Se eliminó la lectura manual del `refresh_token` desde `localStorage`.
   - Se modificó la llamada `axios.post` dirigida a `/auth/refresh` para enviar un cuerpo vacío (ya que el token viaja en la cookie) e incluir explícitamente el parámetro `{ withCredentials: true }`.
   - Se simplificó la condición de captura de errores `401 Unauthorized`. Ahora, cualquier error 401 en peticiones autenticadas (que no sean login o registro) asume que el token ha expirado y lanza el proceso de refresco.
   - **Logro de tu objetivo:** Si la petición `/auth/refresh` falla (lo que sucede cuando el *refresh token* de la cookie ya caducó o es inválido), el código cae directamente en el bloque `catch (refreshError)`. En este punto se limpia la sesión del `localStorage` (`user`, `access_token`, etc.) y se redirige automáticamente al usuario mediante `window.location.href = "/login"`, bloqueando su acceso a la aplicación.

2. **Limpieza en `src/services/auth.service.ts`**:
   - Se eliminó la instrucción innecesaria de guardar `response.data.refresh_token` en `localStorage` al hacer login, ya que el backend no lo incluye en el JSON, sino únicamente en las cabeceras HTTP de la cookie.

## Conclusión

El error ha sido **solucionado exitosamente**. Ahora el ciclo de vida de los tokens es correcto: 
- El *access token* se maneja en el LocalStorage y se inyecta vía Header.
- El *refresh token* fluye a través de cookies HTTP-Only silenciosas.
- Cuando el *refresh token* caduca y el usuario intenta interactuar con el backend, el interceptor capturará el error de `/auth/refresh` y bloqueará de inmediato la sesión devolviendo al usuario a la pantalla de login.
