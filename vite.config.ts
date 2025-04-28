import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..'); // Utilisation de resolve ici au lieu de path.dirname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://pharmacy-request-backend.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  preview: {
    port: 3000,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
