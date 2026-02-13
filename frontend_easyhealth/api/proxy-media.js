export default async function handler(req, res) {
  let { actualPath } = req.query;
  
  if (!actualPath) {
    return res.status(400).send('Missing image path');
  }
  
  // Extra safety: remove redundant 'images/' if it's already there
  let path = actualPath.replace(/^images\//, '');

  const backend = (process.env.VITE_API_URL || "https://childless-jimmy-tactlessly.ngrok-free.dev").replace(/\/api$/, '');
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
