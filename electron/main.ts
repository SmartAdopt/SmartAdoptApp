// electron/main.ts

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow | null = null;

function createWindow() {
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Intercept popup creation for Google OAuth
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('/auth/login/google')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    webPreferences: {
                        preload: path.join(__dirname, 'popup-preload.mjs'),
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