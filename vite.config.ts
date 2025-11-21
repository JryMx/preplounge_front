import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // In production, rewrite /api/* to /api/v1/*
          if (process.env.VITE_BACKEND_URL) {
            return path.replace(/^\/api/, '/api/v1');
          }
          // In local dev, keep /api/* as-is
          return path;
        },
      },
    },
  },
});
