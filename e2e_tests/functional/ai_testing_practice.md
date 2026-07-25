# Pruebas de Integración con Modelos de Inteligencia Artificial (IA)

## 1. ¿Qué es la práctica y de qué trata?
La **Automatización de Pruebas en Integraciones con IA** busca validar flujos donde algoritmos de Inteligencia Artificial (Modelos de Lenguaje o Visión por Computadora) procesan datos en tiempo real. En el caso de SmartAdopt, se trata de subir una imagen para que un modelo **BLIP** extraiga contexto visual y, acto seguido, que un **LLM** (Llama 3 o similar) redacte una biografía y genere un título atractivo. La prueba verifica que todo el ciclo (Frontend -> Backend -> IA -> DB -> Frontend) ocurra exitosamente y sin tiempos muertos (Timeouts).

## 2. Aspectos más importantes
- **Asincronía y Tiempos de Espera (Timeouts):** Los modelos de IA no responden en milisegundos como una base de datos normal. Pueden tardar de 5 a 45 segundos dependiendo de la infraestructura. La prueba automatizada debe tener esperas dinámicas rigurosas.
- **Fallas Silenciosas (Fallbacks):** Es crucial comprobar que, si la IA no logra procesar algo, el software no colapse. En arquitecturas robustas como SmartAdopt, si la IA falla, la mascota igual se registra con un perfil básico.
- **Validación del Output Generado:** Asegurarse de que el botón *"Regenerar Textos con IA"* logre comunicar los requerimientos de la UI hacia el Backend y recuperar exitosamente los metadatos enriquecidos.

## 3. Herramientas Utilizadas y Enfoque Técnico
- **Python, Selenium y Manejo de Imágenes:**
  - El script no solo simula tecleo, sino que inyecta programáticamente una **imagen (JPEG)** para cumplir con el requisito estricto del procesamiento del modelo BLIP (que exige un tensor de entrada de imagen). Para evitar fallos locales si el archivo `firu.jpg` fue borrado, el script incluye un código que descodifica de *Base64* una micro-imagen de prueba (dummy) al vuelo.
  - Se configuró `WebDriverWait` en modo largo (45 segundos) para esperar pacientemente que Llama 3 redacte el perfil en segundo plano.
  - `arguments[0].scrollIntoView()`: Debido a lo largo del formulario, se usa inyección de JS para forzar al navegador a enfocar los botones "Guardar" y "Regenerar Textos".

## 4. Breve Análisis de los Resultados Esperados
**Flujo automatizado:**
El administrador inicia sesión, llena todos los campos incluyendo una biografía cortísima, sube la imagen de prueba y da clic en Guardar. El sistema viaja a `/api/pets` donde el backend invoca a BLIP y Llama 3. Tras lograr el éxito, el script se dirige al catálogo, abre el perfil recién creado y fuerza una **re-generación de IA** dándole clic al botón dedicado, esperando ver un *feedback* visual de "Generando...".

**Resultados obtenidos (Evidencia Log):**
- **Robustez del Pipeline IA:** Como se observa en la terminal (`Created TensorFlow Lite XNNPACK delegate for CPU`), el modelo BLIP se ejecutó correctamente procesando la imagen `firu.jpg`.
- **Sincronización:** El script pudo confirmar la transición exitosa con el mensaje *"Mascota guardada y procesada por IA exitosamente"*. 
- **Validación Visual de Asistente AI:** Se ratificó que el DOM puede manejar estados de *pending* ("Generando...") dándole clic a "Regenerar Textos con IA", interactuando con la API y refrescando la pantalla con la nueva información coherente. ¡La prueba E2E fue un éxito rotundo!
