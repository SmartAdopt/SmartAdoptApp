import { contextBridge, ipcRenderer } from 'electron';

console.log('Script de precarga ejecutado.');

contextBridge.exposeInMainWorld('electronAPI', {
  // Escucha el resultado de OAuth enviado desde el proceso principal
  onOAuthResult: (callback: (data: any) => void) => {
    ipcRenderer.on('oauth-result', (_event, value) => callback(value));
  }
});