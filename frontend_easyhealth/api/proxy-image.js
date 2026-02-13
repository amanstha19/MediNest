// frontend_easyhealth/api/proxy-image.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // The path comes after /proxy-media/
  // Example: /proxy-media/products/img.jpg
  const path = req.url.replace('/proxy-media/', '').split('?')[0];
  const backend = "https://childless-jimmy-tactlessly.ngrok-free.dev";
  const targetUrl = `${backend}/images/${path}?ngrok-skip-browser-warning=1`;

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    
    const buffer = await response.buffer();
    res.send(buffer);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
