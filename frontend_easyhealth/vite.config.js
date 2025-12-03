
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/admin': 'http://localhost:8000', // Proxy admin requests to port 8000
      '/api': 'http://localhost:8000',   // Proxy API requests to port 8000
      
    },
  },
})
