# Electron App Guide

This guide explains how to start, test, and build the desktop version of SmartAdopt using Electron and Vite.

## 1. Running the App in Development

To run the app locally without running into blank screens or network errors, make sure you start the mock backend first. 

### Start the Mock Backend
Open a terminal, navigate to the `frontend` folder, and start the JSON server:

```bash
cd frontend
npm run server
```
*(Note: If you get an `EADDRINUSE` error, it means the server is already running in another terminal tab).*

### Start the Electron App
Open a **new terminal window** (keep the server running), go to the `frontend` directory again, and start the development environment:

```bash
cd frontend
npm run dev
```

Since we are using `vite-plugin-electron`, this single command starts both the React frontend (via Vite) and the Electron desktop app simultaneously.

---

## 2. Testing Functionality (What to Expect)

Once you run `npm run dev`, verify the following scenarios to ensure everything is working correctly:

### The App Window
- **Check:** Does the Electron window open?
- **Expectation:** A native desktop window should pop up automatically with a default size of 1024x768. The app should not open in your standard web browser.

### UI Rendering
- **Check:** Is the React interface visible inside the window?
- **Expectation:** The window should load the SmartAdopt user interface. It works by capturing the local Vite dev server URL and displaying it inside the native window.

### Navigation
- **Check:** Click around the app (e.g., go to the catalog or login page).
- **Expectation:** Routing should work seamlessly inside the desktop window, just like it does on the web.

### Developer Tools
- **Check:** Press `Ctrl + Shift + I` inside the Electron window.
- **Expectation:** The Chromium Developer Tools should open up. Use the **Console** tab to look for any missing modules or CORS errors.

---

## 3. Building for Production (Optional)

If you want to test the compiled version of the app to see how it behaves for the end user:

1. In the `frontend` terminal, build the project:
   ```bash
   npm run build
   ```
   *This compiles both the React frontend (into `dist/`) and the Electron scripts (into `dist-electron/`).*

2. Run the compiled binary:
   ```bash
   npx electron .
   ```
   *The window will open again, but this time it will load the static files directly from `dist/index.html` instead of the Vite dev server.*
