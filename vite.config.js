import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // El sw.js está en /public y Vite lo copia tal cual a /dist
  // No necesita procesamiento — es un service worker estático
  build: {
    rollupOptions: {
      // Asegurar que el SW no se procese como módulo
      external: []
    }
  }
})
