import { ipcRenderer } from 'electron';

// This preload script is injected ONLY into the OAuth popup window.
// It intercepts BroadcastChannel messages intended for the main window.

const OriginalBroadcastChannel = window.BroadcastChannel;

(window as any).BroadcastChannel = function (name: string) {
    const channel = new OriginalBroadcastChannel(name);
    
    // Override postMessage to intercept the token payload
    const originalPostMessage = channel.postMessage.bind(channel);
    
    channel.postMessage = function (message: any) {
        if (name === "oauth_channel") {
            console.log("Intercepted OAuth payload in popup window, sending to main process...");
            // Send the token payload to the Electron main process via IPC
            ipcRenderer.send('oauth-success', message);
        }
        
        // Still call the original in case it's needed locally
        return originalPostMessage(message);
    };

    return channel;
};
