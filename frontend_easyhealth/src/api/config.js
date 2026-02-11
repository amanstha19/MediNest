// frontend_easyhealth/src/api/config.js

/**
 * Centered configuration for API and Media base URLs.
 * Detects the current host to ensure it works on localhost, 
 * private network IPs, or Docker container names.
 */

const getBaseUrl = () => {
    const hostname = window.location.hostname;
    
    // If we are accessing via a specific IP or custom domain, 
    // we should point to the backend on that same host.
    // Defaulting to 127.0.0.1 if hostname is localhost.
    const host = (hostname === 'localhost') ? '127.0.0.1' : hostname;
    
    return `http://${host}:8000`;
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
export const MEDIA_URL = `${BASE_URL}/images`;

export default {
    BASE_URL,
    API_URL,
    MEDIA_URL,
};
