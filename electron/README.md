# SmartAdopt - Electron App

This guide covers running and building the desktop version of SmartAdopt (Vite + Electron).

## 1. Development

**Start Backend (Terminal 1):**
```bash
cd frontend
npm run dev
```
*Note: This starts both the React frontend and the Electron window simultaneously.*

**Testing:**
- The app opens in a native window, not your browser.
- Open DevTools with `Ctrl + Shift + I`.

## 2. Google OAuth Configuration

The OAuth flow requires specific settings to work on the desktop app:
- **User-Agent Spoofing:** `main.ts` uses a standard Chrome user-agent to bypass Google's `disallowed_useragent` restriction.
- **Popup Preload:** `popup-preload.ts` intercepts the `BroadcastChannel` in the OAuth popup and redirects the token to the main process via IPC.
- **IPC Messaging:** The main process receives the token and sends it back to the React app to complete the login seamlessly.

## 3. Production Build

To test the compiled desktop application:

```bash
cd frontend
npm run build
npm run build:electron:local
npx electron .
```