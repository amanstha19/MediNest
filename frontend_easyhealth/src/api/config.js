// frontend_easyhealth/src/api/config.js

/**
 * Centered configuration for API and Media base URLs.
 * Detects the current host to ensure it works on localhost, 
 * private network IPs, Docker container names, or ngrok.
 * 
 * Production/Ngrok: Uses relative URLs (proxy via Vite)
 * Development: Auto-detects backend from current hostname
 */

const getBaseUrl = () => {
    // Check for production API URL first
    const prodApiUrl = import.meta.env?.VITE_API_URL;
    if (prodApiUrl) {
        return prodApiUrl;
    }

    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.startsWith('192.168.') ||
                    window.location.hostname.endsWith('.local');

    // For Hosted Environments (Vercel, etc.)
    // We use the absolute URL for API calls because CORS is supported by the backend.
    // This ensures maximum performance and stability for Chrome/Brave.
    if (!isLocal || window.location.protocol === 'https:') {
        return 'https://childless-jimmy-tactlessly.ngrok-free.dev';
    }
    
    // Development fallback
    const hostname = window.location.hostname;
    const host = (hostname === 'localhost') ? '127.0.0.1' : hostname;
    return `http://${host}:8000`;
};

const rawBaseUrl = getBaseUrl();
// Clean base URL
export const BASE_URL = rawBaseUrl.replace(/\/api$/, '').replace(/\/$/, '');
export const API_URL = `${BASE_URL}/api`;

console.log('🔗 MediNest API Config:', {
    ENVIRONMENT: import.meta.env.MODE,
    HOSTNAME: window.location.hostname,
    BASE_URL,
    API_URL
});

// Detect production for Safari image proxy
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' && 
                     (window.location.protocol === 'https:' || !window.location.hostname.match(/^[0-9.]+$/));

// Use /proxy-media for production (Safari fix), and /images for local dev (Vite proxy)
export const MEDIA_URL = isProduction ? '/proxy-media' : '/images';

// Centralized helper for image URLs
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Remove leading slash and redundant prefixes like "images/" or "media/"
    // because MEDIA_URL already provides the correct starting point.
    let cleanPath = path.startsWith('/') ? path.slice(1) : path;
    cleanPath = cleanPath.replace(/^images\//, '');
    cleanPath = cleanPath.replace(/^media\//, '');
    
    const url = `${MEDIA_URL}/${cleanPath}`;
    
    // If NOT using the proxy (development without Vite proxy), add bypass
    if (!isProduction && BASE_URL !== '' && BASE_URL.includes('ngrok')) {
        return `${url}${url.includes('?') ? '&' : '?'}ngrok-skip-browser-warning=1`;
    }
    
    return url;
};


export default {
    BASE_URL,
    API_URL,
    MEDIA_URL,
    getImageUrl
};
