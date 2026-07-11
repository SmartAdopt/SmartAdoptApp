# Solución Google OAuth para Mobile y Sincronización de Estilos

Este plan aborda la reparación del flujo de Google OAuth en dispositivos móviles (Android) y la sincronización de estilos visuales entre el IDE (Android Studio) y la aplicación.

## Diagnóstico Google OAuth

El problema principal en Android suele ser la configuración del **Deep Link** o la falta de permisos de red.
- **Deep Link**: El `AndroidManifest.xml` ya tiene configurado el esquema `${appAuthScheme}` y el host `oauth-callback`.
- **Backend**: El backend en `auth_routes.py` ya maneja la redirección a `net.programacionwebuce.smartadopt://oauth-callback`.
- **Frontend**: El hook `useGoogleOAuthDeepLink.ts` escucha el evento `appUrlOpen`.

## Cambios Propuestos

### 1. Configuración de Android (OAuth y WebView)

Aseguraremos que el esquema esté correctamente definido y permitiremos el tráfico HTTP si es necesario para desarrollo local.

#### [AndroidManifest.xml](file:///C:/Users/HP/RESPALDOS_WFAP/Universidad/Programacion_Web/React/SmartAdoptApp/android/app/src/main/AndroidManifest.xml)

- Añadir `android:usesCleartextTraffic="true"` para permitir pruebas locales con el backend en HTTP.

```xml
<application
    ...
    android:usesCleartextTraffic="true">
```

### 2. Frontend: Manejo de Deep Links

Mejoraremos la robustez del hook para asegurar que el navegador se cierre correctamente y los tokens se procesen incluso si hay latencia.

#### [useGoogleOAuthDeepLink.ts](file:///C:/Users/HP/RESPALDOS_WFAP/Universidad/Programacion_Web/React/SmartAdoptApp/frontend/src/hooks/useGoogleOAuthDeepLink.ts)

- Añadir un pequeño retraso antes de cerrar el `Browser` para evitar interrupciones en el sistema operativo.

### 3. Backend: Verificación de Origen

#### [auth_routes.py](file:///C:/Users/HP/RESPALDOS_WFAP/Universidad/Programacion_Web/React/SmartAdoptApp/backend/app/routes/auth_routes.py)

- No requiere cambios inmediatos si la URL de redirección es correcta, pero se debe verificar que la `API_BASE_URL` en el frontend coincida con la configurada en la consola de Google Cloud.

---

## Sincronización de Estilos (Android Studio Theme)

Para que la aplicación refleje los colores de Android Studio (o una paleta coherente), crearemos el archivo de colores faltante.

#### [NEW] [colors.xml](file:///C:/Users/HP/RESPALDOS_WFAP/Universidad/Programacion_Web/React/SmartAdoptApp/android/app/src/main/res/values/colors.xml)

Definiremos los colores primarios y de acento para que coincidan con la identidad visual de SmartAdopt.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#CC7832</color> <!-- Naranja IntelliJ/SmartAdopt -->
    <color name="colorPrimaryDark">#2B2B2B</color> <!-- Fondo Oscuro IDE -->
    <color name="colorAccent">#A9B7C6</color> <!-- Gris Texto IDE -->
</resources>
```

---

## Plan de Verificación

### Pasos de Prueba
1. **Compilar y Sincronizar**:
   ```powershell
   npm run build:frontend
   npx cap sync android
   ```
2. **Prueba OAuth**:
   - Abrir la app en un emulador o dispositivo real.
   - Click en "Continuar con Google".
   - Completar el flujo en el navegador.
   - Verificar si la app vuelve al primer plano y navega al Dashboard.
3. **Prueba de Estilos**:
   - Observar si la barra de estado y los colores nativos coinciden con los definidos en `colors.xml`.

### Comandos de Diagnóstico (Logcat)
Si el OAuth falla, ejecutar:
```powershell
adb logcat | findstr "SmartAdopt"
```
Buscar líneas que digan `Received appUrlOpen event` para confirmar si el deep link llegó a la app.
