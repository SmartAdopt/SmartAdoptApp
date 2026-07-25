# Laboratorio de Pruebas - SmartAdoptApp

Este directorio contiene dos laboratorios de pruebas automatizadas para validar el rendimiento y la funcionalidad de la aplicación SmartAdoptApp.

## 📁 Estructura

```text
TestQA/
├── Laboratorio-Pruebas-Rendimiento-k6/          # Pruebas de carga y rendimiento
├── Laboratorio-Pruebas-Funcionalidad-Selenium/  # Pruebas E2E funcionales
├── check*.sql                                   # Consultas de validación de datos
├── count.sql                                    # Conteo de registros para pruebas
├── delete*.sql                                  # Limpieza de base de datos
└── seed-users-fixed.sql                         # Población de datos (semilla)
```

### Scripts SQL de Utilidad
En la raíz de esta carpeta se encuentran varios scripts SQL (`.sql`) que sirven para preparar, verificar y limpiar la base de datos de forma manual antes o después de ejecutar las pruebas.

---

## 🚀 Laboratorio de Pruebas de Rendimiento (K6)

### Descripción
Pruebas de carga y rendimiento utilizando K6 para simular usuarios concurrentes y medir tiempos de respuesta, tasas de error y rendimiento del sistema.

### Scripts Disponibles

| Script | Propósito | Endpoint |
|--------|-----------|----------|
| `auth-login-test.js` | Autenticación | `/auth/login` |
| `pet-catalog-test.js` | Catálogo de mascotas | `/pets/` |
| `adoption-request-test.js` | Solicitudes de adopción | `/adoption-forms/submit` |
| `websocket-test.js` | Notificaciones (WebSocket) | `/notifications` |
| `favorites-sync-test.js` | Favoritos | `/adopter/favorites/` |
| `master-test.js` | **Todos los flujos en paralelo** | Todos los endpoints |

### Escenarios de Prueba

| Escenario | Propósito | Duración | Usuarios |
|-----------|-----------|----------|----------|
| `smoke` | Validación rápida funcionalidad | ~10s | 1-2 VUs |
| `load` | Pruebas de carga normales | 2 min | 10-100 VUs |
| `stress` | Pruebas de estrés extremo | 3.5 min | 30-400 VUs |

### Comandos de Ejecución

#### Ejecutar master-test (recomendado para pruebas de rendimiento)
```powershell
cd TestQA\Laboratorio-Pruebas-Rendimiento-k6

# Smoke (pruebas rápidas)
.\run-all-tests.ps1 -scenario smoke -script master-test.js

# Load (pruebas de carga)
.\run-all-tests.ps1 -scenario load -script master-test.js

# Stress (pruebas de estrés)
.\run-all-tests.ps1 -scenario stress -script master-test.js
```

#### Ejecutar scripts individuales (para debugging específico)
```powershell
# Auth Login
.\run-all-tests.ps1 -scenario smoke -script auth-login-test.js

# Pet Catalog
.\run-all-tests.ps1 -scenario smoke -script pet-catalog-test.js

# Adoption Request
.\run-all-tests.ps1 -scenario smoke -script adoption-request-test.js

# WebSocket
.\run-all-tests.ps1 -scenario smoke -script websocket-test.js

# Favorites Sync
.\run-all-tests.ps1 -scenario smoke -script favorites-sync-test.js
```

#### Ejecutar todos los scripts (completo pero secuencial)
```powershell
# Smoke - todos los scripts
.\run-all-tests.ps1 -scenario smoke

# Load - todos los scripts
.\run-all-tests.ps1 -scenario load

# Stress - todos los scripts
.\run-all-tests.ps1 -scenario stress
```

#### Ejecutar con capturas de pantalla
```powershell
.\run-with-captures.ps1 -scenario smoke
```

### Configuración de Métricas

#### Master-test (todos los flujos en paralelo)
- **Smoke**: 2 VUs × 10 iterations = 20 requests por flujo (100 total)
- **Load**: Ramp-up hasta 10-100 VUs simultáneos
- **Stress**: Ramp-up hasta 30-400 VUs simultáneos

#### Scripts individuales
- **Smoke**: 1 VU × 1 iteration (validación rápida)
- **Load**: Ramp-up según endpoint específico
- **Stress**: Ramp-up agresivo según endpoint

### Umbrales de Rendimiento

| Métrica | Umbral | Descripción |
|---------|--------|-------------|
| `http_req_duration` | p(95) < 2000ms | 95% de requests < 2s |
| `http_req_duration{modulo:auth}` | p(95) < 1500ms | Auth: bcrypt consume CPU |
| `http_req_duration{modulo:catalog}` | p(95) < 800ms | Catálogo debe ser rápido |
| `http_req_duration{modulo:adoption}` | p(95) < 1200ms | Formularios complejos |
| `http_req_duration{modulo:notifications}` | p(95) < 1000ms | Notificaciones en tiempo real |
| `http_req_duration{modulo:favorites}` | p(95) < 1000ms | Operaciones CRUD |
| `http_req_failed` | rate < 0.01 | Menos del 1% de fallos |

### Cómo K6 Expone las Métricas en handleSummary

**Importante:** K6 NO expone todas las métricas con tags en `handleSummary`. Solo ciertas métricas tienen sub-métricas disponibles.

#### Métricas Disponibles con Tags

| Métrica | Expone sub-métricas en handleSummary | Valores disponibles |
|---------|--------------------------------------|-------------------|
| `http_req_duration{modulo:xxx}` | ✅ SÍ | `count`, `passes`, `fails`, `p(95)`, etc. |
| `http_reqs{modulo:xxx}` | ❌ NO | No existe en handleSummary |
| `http_req_failed{modulo:xxx}` | ❌ NO | No existe en handleSummary |

#### Problema Original

El código anterior buscaba claves inexistentes:
```javascript
// ❌ INCORRECTO - Estas claves NO existen en handleSummary
const reqMetric = data.metrics['http_reqs{modulo:auth}'];  // undefined
const failMetric = data.metrics['http_req_failed{modulo:auth}'];  // undefined
```

Resultado:
- `reqs = 0` (clave no encontrada)
- `fails = 0` (clave no encontrada)
- Fallback duplicaba los mismos totales en todos los flujos

#### Solución Implementada

El código ahora busca dinámicamente las claves que realmente existen:

```javascript
// ✅ CORRECTO - Busca claves que existen
const findMetricByTag = (tag) => {
  for (const key of Object.keys(data.metrics || {})) {
    if (key.includes(`modulo:${tag}`) || key.includes(`modulo: ${tag}`)) {
      return data.metrics[key];
    }
  }
  return null;
};

const metric = findMetricByTag('auth');  // Encuentra http_req_duration{modulo:auth}
const reqs = (metric && metric.values && metric.values.count) || 0;
const fails = (metric && metric.values && metric.values.fails) || 0;
```

#### Por Qué los Valores Cuadran Ahora

1. **Iteración dinámica:** Busca en `Object.keys(data.metrics)` todas las claves disponibles
2. **Solo métricas reales:** Usa solo `http_req_duration{modulo:xxx}` que sí expone datos
3. **Valores específicos por flujo:** Cada flujo obtiene sus propias métricas:
   - Auth: `http_req_duration{modulo:auth}` → count/fails reales del flujo auth
   - Catalog: `http_req_duration{modulo:catalog}` → count/fails reales del flujo catalog
   - etc.
4. **Sin duplicados:** Ya no hay fallback que duplique totales

#### Estructura de Datos en handleSummary

```javascript
data.metrics = {
  'http_req_duration{modulo:auth}': {
    values: {
      count: 25,      // Total requests del flujo auth
      passes: 23,     // Requests exitosos
      fails: 2,       // Requests fallidos
      p(95): 1450     // Percentil 95 de duración
    }
  },
  'http_req_duration{modulo:catalog}': {
    values: {
      count: 40,
      passes: 40,
      fails: 0,
      p(95): 750
    }
  },
  // ... otros flujos
}
```

Esta estructura permite que el resumen muestre valores reales y diferenciados por cada flujo, en lugar de ceros o duplicados.

### Reportes Generados

- **HTML**: `summary-{scenario}-{script}.html` - Reporte visual interactivo
- **Consola**: Tablas ASCII con desglose por flujo y consolidado
- **Logs**: `logs/{script}.txt` - Salida completa de K6

### Diferencia: Master-test vs Scripts Individuales

**master-test.js:**
- Ejecuta los 5 flujos **SIMULTÁNEAMENTE** en paralelo
- Simula carga real del sistema completo
- Un solo test con 5 escenarios concurrentes
- Más realista para pruebas de integración

**Scripts individuales:**
- Cada script ejecuta **SOLO UN** flujo específico
- Se ejecutan **SECUENCIALMENTE** (uno tras otro)
- Sirven para aislar problemas específicos de cada endpoint
- No simulan carga concurrente real

**Ejemplo práctico:**
- **master-test load**: 10 auth + 20 catalog + 10 adoption + 10 notifications + 20 favorites = 70 usuarios simultáneos
- **Scripts individuales load**: Primero 10 auth (solo), luego 20 catalog (solo), etc. - nunca hay 70 usuarios al mismo tiempo

---

## 🧪 Laboratorio de Pruebas Funcionales (Selenium)

### Descripción
Pruebas end-to-end (E2E) utilizando Selenium WebDriver para validar el flujo completo de usuario desde la interfaz web.

### Casos de Prueba

| Test | Descripción | Flujo |
|------|-------------|-------|
| `test_adopcion_solicitar_y_aprobar` | Solicitar adopción completa | Login → Explorar → Perfil → Solicitar → Confirmar |
| `test_adopcion_seleccionar_solicitud` | Ver solicitudes creadas | Login → Solicitudes → Seleccionar |

### Requisitos Previos

1. **Configurar archivo .env:**
```powershell
cd TestQA\Laboratorio-Pruebas-Funcionalidad-Selenium
copy .env.example .env
# Editar .env con tus credenciales y URLs
```

2. **Instalar dependencias:**
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Comandos de Ejecución

```powershell
cd TestQA\Laboratorio-Pruebas-Funcionalidad-Selenium

# Ejecutar todos los tests
pytest tests/

# Ejecutar test específico
pytest tests/test_adopcion_e2e.py::test_adopcion_solicitar_y_aprobar

# Ejecutar con salida detallada
pytest tests/ -v -s

# Ejecutar con capturas de pantalla automáticas
pytest tests/ --html=report.html
```

### Configuración

El archivo `conftest.py` configura automáticamente:
- Carga de variables de entorno desde `.env`
- Driver de Chrome con opciones optimizadas
- WebDriverWait para esperas explícitas
- Capturas de pantalla automáticas tras cada test

### Variables de Entorno (.env)

```env
# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Credenciales de prueba
ADOPTER_EMAIL=test_adopter@example.com
ADOPTER_PASS=Password123!
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=AdminPass123!
```

### Helpers Disponibles

```python
from tests.helpers import (
    sa_login,           # Login de usuario
    sa_logout,          # Cerrar sesión
    sa_ir_a_explorar,   # Navegar a explorar mascotas
    sa_ir_a_solicitudes, # Navegar a solicitudes
    esperar_url_contiene, # Esperar que URL contenga texto
    encontrar_clickable_xpath # Encontrar elemento clickeable
)
```

---

## 🔧 Solución de Problemas Comunes

### K6

**Problema: Docker no conecta con localhost**
- Solución: Usar `http://host.docker.internal:8000` en lugar de `localhost:8000`

**Problema: Métricas muestran 0 en master-test**
- Solución: Verificar que los tags `modulo:xxx` estén configurados en las requests

**Problema: Tests fallan por timeout**
- Solución: Aumentar el timeout en los parámetros de las requests HTTP

### Selenium

**Problema: No encuentra el archivo .env**
- Solución: Copiar `.env.example` a `.env` y completar las variables

**Problema: Elementos no clickeables**
- Solución: Usar `driver.execute_script("arguments[0].click();", element)` para forzar el click

**Problema: Tests fallan por timing**
- Solución: Aumentar los tiempos de espera en `time.sleep()` o usar WebDriverWait

---

## 📊 Interpretación de Resultados

### K6 - Tablas de Resumen

**Tabla MASTER TEST - DESGLOSE POR FLUJO:**
- **VUs**: Máximo de usuarios virtuales simultáneos
- **Total**: Cantidad total de peticiones realizadas
- **Exitosas**: Peticiones exitosas con porcentaje
- **Fallidas**: Peticiones fallidas con porcentaje
- **Estado**: OK (0% fallos), FALLOS (1-10%), CRÍTICO (>10% fallos)

**Tabla CONSOLIDADO:**
- Compara métricas entre escenarios Smoke, Load y Stress
- Útil para identificar degradación de rendimiento

### Selenium - Salida de Tests

- **✅ PASS**: Test completado exitosamente
- **❌ FAIL**: Test falló con mensaje descriptivo
- **⚠️ WARNING**: Advertencia pero test continuó
- **Capturas**: Screenshots automáticos en caso de fallo

---

## 🎯 Mejores Prácticas

### Para Pruebas de Rendimiento (K6)

1. **Usar master-test** para pruebas de rendimiento realistas
2. **Ejecutar smoke primero** para validar funcionalidad básica
3. **Monitorear umbrales** - ajustar según SLAs del negocio
4. **Analizar trends** - comparar resultados entre ejecuciones
5. **Limpiar datos** entre ejecuciones para consistencia

### Para Pruebas Funcionales (Selenium)

1. **Mantener .env actualizado** con credenciales válidas
2. **Usar WebDriverWait** en lugar de sleeps fijos cuando sea posible
3. **Validar estado final** de la aplicación después de cada test
4. **Revisar capturas** automáticas para debugging
5. **Ejecutar en orden** - algunos tests dependen de datos creados por otros

---

## 📝 Notas de Mantenimiento

### Iteraciones y VUs

**Configuración actual unificada:**
- **Smoke**: 2 VUs × 10 iterations = 20 requests por flujo
- **Load/Stress**: Usan ramping-vus con tiempo, no iterations

**Por qué esta configuración:**
- Smoke verifica consistencia de respuestas sin sobrecargar
- Load/Stress simulan patrones de uso real con ramp-up gradual
- Iteraciones fijas en smoke permiten comparación entre ejecuciones

### Métricas K6

**Importante:** Solo `http_req_duration{modulo:xxx}` expone sub-métricas con `count/passes/fails`. Las métricas `http_reqs{modulo:xxx}` y `http_req_failed{modulo:xxx}` no existen en handleSummary, por eso el código busca dinámicamente las claves disponibles.

---

## 🚀 Flujo de Trabajo Recomendado

### Para Desarrollo Continuo

1. **Smoke tests (K6)** - Validar cambios rápidos
   ```powershell
   .\run-all-tests.ps1 -scenario smoke -script master-test.js
   ```

2. **Funcionales (Selenium)** - Validar flujos de usuario
   ```powershell
   pytest tests/test_adopcion_e2e.py -v
   ```

3. **Load tests (K6)** - Antes de deploy a staging
   ```powershell
   .\run-all-tests.ps1 -scenario load -script master-test.js
   ```

4. **Stress tests (K6)** - Antes de deploy a producción
   ```powershell
   .\run-all-tests.ps1 -scenario stress -script master-test.js
   ```

### Para Investigación de Problemas

1. **Ejecutar script individual** del endpoint problemático
2. **Revisar logs** en `logs/{script}.txt`
3. **Analizar reporte HTML** para detalles de timing
4. **Ejecutar Selenium** para validar funcionalidad
5. **Comparar con baseline** de ejecuciones anteriores

---

## 📞 Soporte

Para problemas o dudas sobre las pruebas:
- Revisar logs en `logs/` (K6) o capturas (Selenium)
- Verificar que el backend y frontend estén ejecutándose
- Validar configuración de `.env` (Selenium) o variables de entorno (K6)
- Consultar documentación oficial de [K6](https://k6.io/docs/) y [Selenium](https://www.selenium.dev/documentation/)
