// frontend/vite.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
  base: process.env.VITE_WEB_ONLY === 'true' ? '/' : './',
  plugins: [
    react(),
    ...(process.env.VITE_WEB_ONLY === 'true'
      ? []
      : [
        electron([
          {
            entry: '../electron/main.ts',
          },
          {
            // Flat API treats this as a main-process target (ESM when package.json is type:module).
            // Build preload from `input` (not `lib.entry`) to force true CJS output.
            vite: {
              build: {
                rolldownOptions: {
                  input: '../electron/preload.ts',
                  output: {
                    format: 'cjs',
                    entryFileNames: 'preload.cjs',
                    chunkFileNames: '[name].cjs',
                  },
                },
              },
            },
            onstart(options) {
              try {
                options.reload();
              } catch {
                console.warn('Could not reload Electron: channel closed');
              }
            },
          },
          {
            // Same CJS enforcement as preload above.
            vite: {
              build: {
                rolldownOptions: {
                  input: '../electron/popup-preload.ts',
                  output: {
                    format: 'cjs',
                    entryFileNames: 'popup-preload.cjs',
                    chunkFileNames: '[name].cjs',
                  },
                },
              },
            },
            onstart(options) {
              try {
                options.reload();
              } catch {
                console.warn('Could not reload Electron: channel closed');
              }
            },
          },
        ]),
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