// frontend_easyhealth/api/proxy-media.js
export default async function handler(req, res) {
  // Get the path from the URL. 
  // We use req.url which contains the path after the rewrite.
  // Example: /proxy-media/products/img.jpg
  let path = req.url.split('?')[0]; 
  
  // Remove common prefixes used in rewrites or direct calls
  path = path.replace('/api/proxy-media', '');
  path = path.replace('/proxy-media', '');
  
  // Remove leading slash
  if (path.startsWith('/')) path = path.slice(1);
  
  // Extra safety: remove redundant 'images/' if it's already there
  path = path.replace(/^images\//, '');
  
  if (!path) {
    return res.status(400).send('Missing image path');
  }

  const backend = "https://childless-jimmy-tactlessly.ngrok-free.dev";
  const targetUrl = `${backend}/images/${path}?ngrok-skip-browser-warning=1`;

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).send(`Backend error: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
