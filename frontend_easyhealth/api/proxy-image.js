// frontend_easyhealth/api/proxy-image.js
// frontend_easyhealth/api/proxy-image.js

export default async function handler(req, res) {
  const { actualPath } = req.query;
  const backend = (process.env.VITE_API_URL || "https://childless-jimmy-tactlessly.ngrok-free.dev").replace(/\/api$/, '');
  const targetUrl = `${backend}/images/${actualPath}?ngrok-skip-browser-warning=1`;

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
