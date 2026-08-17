import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Allow all external hosts (required for Cloudflare Tunnel / ngrok access)
      allowedHosts: true as any,
      proxy: {
        '/api/workout': { target: 'http://localhost:8083', changeOrigin: true },
        '/api/exercises': { target: 'http://localhost:8083', changeOrigin: true },
        '/api/group-sessions': { target: 'http://localhost:8083', changeOrigin: true },
        '/api/activities': { target: 'http://localhost:8083', changeOrigin: true },
        '/api/chat': { target: 'http://localhost:8082', changeOrigin: true },
        '/api': { target: 'http://localhost:8080', changeOrigin: true },
      },
    },
  };
});
