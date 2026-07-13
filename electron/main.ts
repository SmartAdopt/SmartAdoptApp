// electron/main.ts

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';

// ─── GPU / Rendering Fix ──────────────────────────────────────────────────────
// Systems with incompatible GPU drivers crash with exit_code=-2147483645.
// Strategy: disable hardware GPU entirely and force SwiftShader (CPU-based
// software OpenGL) so Chromium always has a valid rendering path.
//
// ⚠️  DO NOT add 'disable-software-rasterizer' here — that flag combined with
//     'disable-gpu' leaves Chromium with NO renderer at all → blank white screen.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('use-gl', 'swiftshader');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.commandLine.appendSwitch('no-sandbox');
// ─────────────────────────────────────────────────────────────────────────────


// ─── Path Resolution ─────────────────────────────────────────────────────────
// app.getAppPath() is the only reliable way to resolve paths inside a packaged
// asar bundle. import.meta.url breaks in production (resolves to "file:///C:/").
const APP_ROOT = app.getAppPath();
// ─────────────────────────────────────────────────────────────────────────────

let win: BrowserWindow | null = null;

function createWindow() {
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        icon: path.join(APP_ROOT, 'src', 'assets', 'icon-only.png'),
        webPreferences: {
            preload: path.join(APP_ROOT, 'dist-electron', 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(APP_ROOT, 'dist', 'index.html'));
    }

    // Intercept popup creation for Google OAuth
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('/auth/login/google')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    webPreferences: {
                        preload: path.join(APP_ROOT, 'dist-electron', 'popup-preload.cjs'),
                        contextIsolation: false, // We need to override window.BroadcastChannel natively
                        nodeIntegration: true // Allows importing ipcRenderer in the popup-preload
                    }
                }
            };
        }
        return { action: 'allow' };
    });

    // Spoof User-Agent for Google to prevent "disallowed_useragent"
    win.webContents.on('did-create-window', (childWindow) => {
        childWindow.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    });
}

app.whenReady().then(() => {
    createWindow();

    // Listen for the intercepted OAuth message from the popup
    ipcMain.on('oauth-success', (event, message) => {
        // Send it to the main React app
        if (win) {
            win.webContents.send('oauth-result', message);
        }

        // Close the OAuth popup
        const popup = BrowserWindow.fromWebContents(event.sender);
        if (popup) popup.close();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});