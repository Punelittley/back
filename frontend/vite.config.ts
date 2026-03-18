import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['back-xlm1.onrender.com'], 
    host: '0.0.0.0',
    port: 10000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})