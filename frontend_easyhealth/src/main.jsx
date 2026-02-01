import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/ui/modern-ui-2027.css';
import './components/ui/Toast.css';
import "bootstrap/dist/css/bootstrap.min.css";
import App from './App.jsx'
import { ToastProvider, BackToTop } from './components/ui/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
      <BackToTop />
    </ToastProvider>
  </StrictMode>,
)

