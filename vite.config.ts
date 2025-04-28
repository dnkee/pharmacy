import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://pharmacy-backend-cyq7.onrender.com',
        changeOrigin: true,
        secure: true
      },
    }
  },
  preview: {
    port: 3000,
    strictPort: true,
  }
})
