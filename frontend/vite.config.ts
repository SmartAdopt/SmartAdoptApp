// frontend/vite.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: '../electron/main.ts',
      },
      {
        entry: '../electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
      {
        entry: '../electron/popup-preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
  ],

  // 1. Vite Server Configuration (Proxy for Dockerized Backend)
  server: {
    port: 5173,
    proxy: {
      // Proxy for Authentication endpoints
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false, // Set to false since local Docker doesn't use HTTPS
      },
      // Proxy for general API endpoints (e.g., catalog, users)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy for WebSockets (Real-time notifications RF-05)
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      }
    }
  },

  // 2. Vitest Configuration (Unchanged)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
});