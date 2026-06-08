// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
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