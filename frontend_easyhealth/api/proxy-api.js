/* eslint-env node */
/* global process */

export default async function handler(req, res) {
  const { actualPath } = req.query;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const search = url.search;
  
  // Use VITE_API_URL from environment or fallback
  const backend = (process.env.VITE_API_URL || "https://childless-jimmy-tactlessly.ngrok-free.dev").replace(/\/api$/, '');
  const targetUrl = `${backend}/api/${actualPath}${search}`;

  // Set CORS headers to allow requests from Vercel frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Forward all headers from original request
  const headers = { ...req.headers };
  delete headers.host; // Let fetch handle the host header
  headers['ngrok-skip-browser-warning'] = '1';

  try {
    console.log(`[Proxy] ${req.method} ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
    
    const data = await response.text();
    
    // Check if response is HTML (error page) instead of expected JSON/API response
    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html') || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html');
    
    if (isHtml && !actualPath.includes('admin')) {
      console.error(`[Proxy] Backend returned HTML instead of JSON. Backend may be offline or URL expired: ${backend}`);
      console.error(`[Proxy] Response preview: ${data.substring(0, 200)}`);
      
      return res.status(502).json({ 
        error: 'Backend unavailable', 
        message: 'The backend server appears to be offline or the ngrok URL has expired. Please check your backend status and update VITE_API_URL environment variable.',
        backendUrl: backend,
        hint: 'If using ngrok, restart your backend and update the VITE_API_URL in Vercel environment variables'
      });
    }
    
    // Copy response headers back to res (except CORS headers which we set manually)
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('access-control')) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status).send(data);
  } catch (error) {
    console.error('[Proxy] API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      backendUrl: backend,
      hint: 'Check if your backend is running and VITE_API_URL is set correctly in Vercel environment variables'
    });
  }
}
