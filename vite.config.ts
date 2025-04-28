import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://pharmacy-request-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  }
})
