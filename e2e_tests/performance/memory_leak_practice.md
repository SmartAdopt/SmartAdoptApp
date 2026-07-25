# Prueba de Rendimiento: Mini-Soak Test (Fugas de Memoria)

## 1. ¿Qué es la práctica y de qué trata?
Un **Soak Test** (Prueba de Remojo o Resistencia) tradicional consiste en dejar el sistema bajo una carga de trabajo constante durante horas o días para descubrir problemas sutiles que no se ven en pruebas cortas, como **fugas de memoria (memory leaks)**, desgaste del disco o agotamiento del *pool* de conexiones a la base de datos.

En esta variante "Mini-Soak", ejecutaremos una carga **extrema** durante un periodo muy corto (3 a 5 minutos) utilizando **Locust** en lugar de K6. 

El objetivo de esta prueba es observar cómo se comporta la RAM del contenedor del backend `smart-adopt-backend-dev` en **Dozzle**. Al inyectar peticiones que traen listas largas de datos (`/pets/`) mezcladas con operaciones pesadas de base de datos (`/admin/dashboard`), la memoria se disparará. Lo que queremos comprobar no es cuánto sube, sino **si la memoria baja y se estabiliza cuando la prueba se detiene**. Si la memoria nunca se libera, tenemos un Memory Leak.

## 2. Requisitos Previos
- Entorno de Python activo en `backend/.venv`.
- Tener la librería `locust` instalada.
- Archivo `admin_token.json` válido y fresco.

## 3. Pasos de Ejecución

### Paso 1: Instalar Locust y verificar Token
Abre una terminal y asegúrate de que el token es válido:
```powershell
cd e2e_tests/performance
# Instala locust si no lo has hecho
..\..\backend\.venv\Scripts\pip.exe install locust
# Genera un nuevo token
..\..\backend\.venv\Scripts\python.exe generate_admin_token.py
```

### Paso 2: Ejecutar la prueba en terminal (Headless)
Usaremos Locust en su modo *Headless* (sin interfaz gráfica) para ejecutar la prueba de estrés directamente desde la consola durante **3 a 5 minutos**.
```powershell
# Ejecutaremos 50 usuarios concurrentes, apareciendo a razón de 5 por segundo, y apuntando al backend local.
..\..\backend\.venv\Scripts\locust.exe -f locustfile.py MemoryLeakUser --headless -u 50 -r 5 --host=http://localhost:8000
```
*Nota: Deja la terminal corriendo y pasa al Paso 3 de inmediato.*

### Paso 3: Monitorizar en Dozzle (El momento clave)
1. Abre tu navegador y ve a `http://localhost:8080` (Dozzle).
2. Haz clic en el contenedor `smart-adopt-backend-dev`.
3. Ve a la pestaña de **Métricas (Stats/Memory)**.
4. Observa la gráfica de RAM: verás que empieza a subir drásticamente.

### Paso 4: Detener y Observar
Después de unos 3-5 minutos, **presiona `Ctrl+C` en la terminal** donde corre Locust para detener el bombardeo.
Vuelve a mirar Dozzle:
- **Prueba Superada:** El Garbage Collector de Python limpia los objetos sin uso y la RAM cae bruscamente o se va vaciando de a pocos hasta volver a la normalidad (ej. ~100MB).
- **Prueba Fallida (Memory Leak):** La memoria se queda estancada en lo más alto para siempre (ej. clavada en 800MB) y no baja, lo que indica que FastAPI o alguna variable global retiene la referencia a los objetos.

## 4. Evidencias
Guarda las siguientes capturas para tu informe de QA:
1. `e2e_tests/screenshots/locust_stats.png`: Captura de los resultados de Locust en la terminal al presionar Ctrl+C.
2. `e2e_tests/screenshots/memory_recovery.png`: Captura del gráfico de Dozzle mostrando cómo la memoria bajó tras finalizar la prueba.
