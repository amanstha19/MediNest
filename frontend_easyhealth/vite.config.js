
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: {
      port: 5173,
    },
    proxy: {
      '/admin': 'http://backend:8000', // Proxy admin requests to backend service
      '/api': 'http://backend:8000',   // Proxy API requests to backend service

    },
  },
})
