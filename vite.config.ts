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
    // Note: Vite proxy is NOT used in the current architecture
    // Frontend is served through Express proxy in dev, and static files in production
    // All API calls go directly through Express at port 5000, not through Vite
    // This proxy config is kept for reference but not actively used
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // No rewriting needed - frontend calls /api/v1/* directly
      },
    },
  },
});
