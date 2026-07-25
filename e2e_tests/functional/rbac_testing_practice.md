# Pruebas de Seguridad en UI: Control de Acceso (RBAC)

## 1. ¿Qué es la práctica y de qué trata?
Las **Pruebas de Control de Acceso Basado en Roles (RBAC)** dentro del contexto de pruebas End-to-End (E2E) consisten en validar que las restricciones de seguridad de la interfaz gráfica y del enrutador (Router) funcionen correctamente para distintos perfiles de usuario. La práctica evalúa escenarios negativos: se fuerza deliberadamente a un usuario sin privilegios (ej. un `Adopter`) a ingresar a zonas restringidas (ej. vistas del `Admin`) mediante la manipulación directa de las URLs, con el objetivo de confirmar que la aplicación intercepta el acceso y protege los formularios e información confidencial.

## 2. Aspectos más importantes
- **Navegación Forzada (Intrusión):** A diferencia de las pruebas funcionales estándar que siguen "el camino feliz" haciendo clic en botones visibles, aquí se inyectan URLs directamente en la barra de direcciones del navegador para saltarse la interfaz.
- **Doble Aserción de Seguridad:** No basta con verificar que no haya botones prohibidos. La prueba debe validar que el sistema redirija activamente al usuario (ej. hacia el Login o Inicio) o, en su defecto, que bloquee la renderización de componentes sensibles (ocultando formularios del DOM).
- **Protección del Router:** Garantiza que los "Guardias de Rutas" (Route Guards) en aplicaciones modernas de una sola página (SPA, como React) estén leyendo correctamente el token o los claims de rol del usuario.

## 3. Herramientas Utilizadas y Enfoque Técnico
- **Python y Selenium WebDriver:** Aunque Selenium es típicamente usado para flujos funcionales, es una herramienta excelente para auditar la seguridad del Frontend. 
- **Técnicas del Código Implementado:**
  - `driver.get(url_restringida)`: Se utilizó para inyectar y forzar la entrada directa a la URL `#/admin/pets/new` evadiendo la navegación natural.
  - `driver.current_url`: Pieza clave de la aserción técnica que permitió leer instantáneamente la URL resultante del navegador tras el intento de intrusión, detectando si el router intervino.
  - `driver.find_elements(By.TAG_NAME, "form")`: Estrategia de respaldo (Fallback) empleada. Si el frontend fallaba en redirigir, el script escaneaba el árbol de elementos HTML (DOM) buscando etiquetas `<form>` para certificar que ningún componente de creación se hubiera filtrado a la vista.

## 4. Breve Análisis de los Resultados Obtenidos
**Flujo automatizado:**
El script automatizó el inicio de sesión como **Adoptante** (`Exal45@gmail.com`). Una vez validada la sesión y el token, se inyectó la petición de acceder al panel de creación exclusivo de administradores. 

**Resultados obtenidos:**
- **Interceptación Exitosa:** Se comprobó que el router de `SmartAdopt` detecta correctamente la falta de permisos del rol Adoptante. Al intentar acceder a `#/admin/pets/new`, el sistema bloqueó el renderizado y **redirigió inmediatamente** la petición hacia la raíz de la aplicación (`#/`).
- **Defensa en Profundidad del Frontend:** La evidencia (log y captura generada `rbac_blocked_screenshot.png`) ratifica que las vistas sensibles de administración no son expuestas bajo ninguna circunstancia a usuarios normales.
- **Fiabilidad del Guard (React Router):** La prueba demuestra que la configuración de rutas protegidas del frontend es robusta contra manipulaciones manuales de URL.
