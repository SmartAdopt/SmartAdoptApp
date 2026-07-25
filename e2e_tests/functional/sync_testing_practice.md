# Pruebas de Experiencia de Usuario: Sincronización Multi-Pestaña

## 1. ¿Qué es la práctica y de qué trata?
La **Prueba de Sincronización de Sesión** consiste en validar que el estado global de una aplicación (en este caso, los "Favoritos" de un usuario) se mantenga consistente sin importar cuántas pestañas, ventanas o dispositivos se estén utilizando simultáneamente con la misma cuenta. Dado que SmartAdopt utiliza una interfaz moderna tipo *swipe* y un catálogo asíncrono, es vital garantizar que marcar o desmarcar a una mascota impacte inmediatamente en la base de datos y se refleje al navegar en otras instancias de la aplicación.

## 2. Aspectos más importantes
- **Compartición de Sesión:** Cuando se abren múltiples pestañas en el mismo navegador, el motor de navegación comparte el *Local Storage* y las cookies. La prueba se apoya en esto para simular un segundo dispositivo logueado o un usuario multitarea.
- **Flujo Bidireccional:** No basta con probar que al agregar en la Pestaña A aparezca en la Pestaña B (Sincronización Positiva). También se debe verificar que al eliminar en la Pestaña B, se borre de la Pestaña A (Sincronización Negativa o Inversa).
- **Manejo del DOM Reactivo:** Se evalúa la capacidad de *React* (y posiblemente herramientas como *React Query*) de re-fetchear o actualizar el árbol de componentes (DOM) cuando la pestaña recupera el foco.

## 3. Herramientas Utilizadas y Enfoque Técnico
- **Selenium WebDriver (Manejo de Ventanas):** 
  - `driver.execute_script("window.open('');")` se usa para forzar la apertura de una pestaña virgen.
  - `driver.window_handles` y `driver.switch_to.window(tabs[1])` permiten al script saltar entre las dos pestañas simulando a un usuario que tiene el catálogo de *Explorar* en un monitor y sus *Favoritos* en otro.
- **Técnicas de Aserción:** 
  - La prueba extrae dinámicamente el nombre de la mascota de la tarjeta de Tinder (`.tinder-card__name`) de la Pestaña 1 y la guarda en memoria. Luego cruza a la Pestaña 2 y busca ese nombre exacto dentro del H6 de la cuadrícula, garantizando que estemos rastreando a la mascota correcta y no un falso positivo.

## 4. Breve Análisis de los Resultados Esperados
**Flujo automatizado:**
El usuario inicia sesión en la Pestaña 1 (Explorar), le da "Favorite" a la mascota en pantalla. Inmediatamente el robot abre una Pestaña 2 (Mis Favoritos) y revisa que la mascota haya llegado a la lista. Posteriormente, desde esa misma Pestaña 2, el robot borra la mascota presionando el corazón rojo. Finalmente regresa a la Pestaña 1, navega a Favoritos y comprueba que la cuadrícula esté vacía.

**Resultados obtenidos (Evidencia Log):**
- **Idempotencia de Prueba:** El script limpió los favoritos previos exitosamente (`[Pestaña 1] Se encontraron 2 favoritos previos. Eliminándolos...`) garantizando que la aserción fuera precisa.
- **Consistencia de Datos Comprobada:** Se valida que el backend actualiza los registros a la velocidad requerida (`[Pestaña 2] -> ÉXITO (Sincronización Positiva): 'Dalto' aparece correctamente`).
- **Sincronización Bidireccional:** Al eliminar el registro en la segunda pestaña, el sistema lo eliminó de la base de datos de inmediato (`[Pestaña 1] -> ÉXITO (Sincronización Negativa): 'Dalto' ha desaparecido de esta pestaña también`), comprobando la robustez de la arquitectura.
