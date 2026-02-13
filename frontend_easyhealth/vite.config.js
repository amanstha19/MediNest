
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite plugin to inject grecaptcha mock before other scripts
function grecaptchaMock() {
  return {
    name: 'grecaptcha-mock',
    transformIndexHtml(html) {
      // Inject the mock at the beginning of head
      return html.replace(
        '<head>',
        `<head><script>window.grecaptcha={ready:function(c){setTimeout(c,100)},render:function(c,t){return 0}};</script>`
      );
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), grecaptchaMock()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok.io',
      '.loca.lt',
      'localhost',
    ],
    hmr: {
      port: 5173,
    },
    proxy: {
      '/admin': process.env.VITE_RUNNING_IN_DOCKER ? 'http://backend:8000' : 'http://127.0.0.1:8000', 
      '/api': process.env.VITE_RUNNING_IN_DOCKER ? 'http://backend:8000' : 'http://127.0.0.1:8000',   
      '/images': process.env.VITE_RUNNING_IN_DOCKER ? 'http://backend:8000' : 'http://127.0.0.1:8000', 
    },
  },
})
