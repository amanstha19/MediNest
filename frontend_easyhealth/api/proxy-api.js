// frontend_easyhealth/api/proxy-api.js
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/', '');
  const search = url.search;
  
  const backend = "https://childless-jimmy-tactlessly.ngrok-free.dev";
  const targetUrl = `${backend}/api/${path}${search}`;

  // Forward all headers from original request
  const headers = { ...req.headers };
  delete headers.host; // Let fetch handle the host header
  headers['ngrok-skip-browser-warning'] = '1';

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
    
    const data = await response.text();
    
    // Copy response headers back to res
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
