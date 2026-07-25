# Pruebas de Funcionalidad (End-to-End)

## 1. ¿Qué es la práctica y de qué trata?
Las **Pruebas Funcionales (E2E o End-to-End)** son validaciones automatizadas que simulan el comportamiento de un usuario real frente a una aplicación web. La práctica consiste en recorrer los flujos críticos del sistema de principio a fin, asegurando que todos los componentes (Frontend, Backend, Base de Datos) se integren y funcionen correctamente en conjunto, evaluando la aplicación desde la perspectiva final en lugar de examinar el código interno.

## 2. Aspectos más importantes
- **Simulación Realista:** Interacción directa con el DOM (clics, ingresos de texto, scrolls) tal como lo haría una persona.
- **Localizadores Precisos:** Uso de estrategias estables (como XPath o CSS Selectors) para ubicar botones o tarjetas, incluso si el diseño visual cambia ligeramente.
- **Manejo de Esperas (Waits):** Uso fundamental de esperas dinámicas para aguardar a que los componentes o respuestas de red carguen antes de interactuar.
- **Validación Cruzada:** Capacidad de verificar el ciclo de vida de un dato a través de diferentes roles (ej. la acción de un Admin repercute en la vista de un Adoptante).

## 3. Herramientas Utilizadas y por qué
- **Python:** Elegido como lenguaje por su sintaxis limpia, rápida curva de aprendizaje y facilidad para ejecutar scripts sin necesidad de configuraciones o compilaciones complejas.
- **Selenium WebDriver:** Se eligió esta herramienta porque es el estándar más maduro para la automatización de navegadores reales. Permite evadir limitaciones que tendrían pruebas más básicas, facilitando interactuar con frameworks modernos (como React y Material UI que tiene SmartAdopt), realizar clics forzados mediante JavaScript y tomar capturas de pantalla automáticas para depurar flujos visuales.

## 4. Breve Análisis de los Resultados
**Flujo automatizado:**
Se simuló al **Administrador** (quien inicia sesión, navega a *Revisar Solicitudes*, elige una tarjeta "Pendiente" y hace clic en "Aprobar Adopción") y posteriormente al **Adoptante** (quien tras limpiar la sesión anterior, inicia sesión, va a su panel y revisa el cambio de estado).

**Lo que se obtuvo:**
- **Validación Exitosa de Integración:** La prueba finalizó sin errores, comprobando que la plataforma `SmartAdopt` comunica y actualiza correctamente la base de datos desde el lado del administrador hacia la vista del usuario normal.
- **Confirmación Visual:** Se logró verificar explícitamente en el DOM del adoptante la etiqueta **"Aprobada"**, asegurando la trazabilidad del proceso.
- **Robustez del Script:** A pesar de los tiempos de carga de la interfaz en React, las políticas de esperas explícitas de Selenium absorbieron la latencia de red, entregando como resultado una prueba estable, rápida y lista para integrarse en un proceso de Integración Continua (CI).
