# 🚀 MediNest Ngrok Deployment Guide

Complete guide for deploying MediNest using ngrok to make your application publicly accessible.

## 📋 Prerequisites

- ✅ Ngrok installed (already verified at `/usr/local/bin/ngrok`)
- ✅ Ngrok account (sign up at [ngrok.com](https://ngrok.com))
- ✅ Docker and Docker Compose installed
- ✅ MediNest project running locally

## 🎯 Quick Start (3 Steps)

### Step 1: Get Your Ngrok Authtoken

1. Sign up or log in at [ngrok.com](https://dashboard.ngrok.com/signup)
2. Get your authtoken from [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Update `ngrok.yml` in the project root:

```yaml
authtoken: YOUR_ACTUAL_TOKEN_HERE
```

### Step 2: Start Your Services

**Using Docker (Recommended):**
```bash
docker-compose up -d
```

**Or run locally:**
```bash
# Terminal 1 - Backend
cd backend_easyhealth
python manage.py runserver

# Terminal 2 - Frontend
cd frontend_easyhealth
npm run dev
```

### Step 3: Launch Ngrok

```bash
./start-ngrok.sh
```

The script will:
- ✅ Check if services are running
- ✅ Start ngrok tunnels for frontend and backend
- ✅ Display your public URLs
- ✅ Provide setup instructions

## 📝 Manual Configuration

If you prefer manual setup:

### 1. Start Ngrok Tunnels

**Option A: Using config file (recommended)**
```bash
ngrok start --all --config ngrok.yml
```

**Option B: Separate tunnels**
```bash
# Terminal 1 - Backend tunnel
ngrok http 8000

# Terminal 2 - Frontend tunnel
ngrok http 5173
```

### 2. Get Your URLs

Visit [http://localhost:4040](http://localhost:4040) to see the ngrok web interface and copy your URLs.

### 3. Update Frontend Configuration

Create `frontend_easyhealth/.env.local`:

```env
VITE_API_URL=https://YOUR-BACKEND-URL.ngrok-free.app/api
```

Example:
```env
VITE_API_URL=https://abc123def456.ngrok-free.app/api
```

### 4. Restart Frontend

**Docker:**
```bash
docker-compose restart frontend
```

**Local:**
```bash
cd frontend_easyhealth
npm run dev
```

## 🔧 Advanced Configuration

### Environment Variables (Optional)

Add to your `.env` file for dynamic configuration:

```env
# Ngrok URLs (update after starting ngrok)
NGROK_BACKEND_URL=https://your-backend.ngrok-free.app
NGROK_FRONTEND_URL=https://your-frontend.ngrok-free.app
```

### Custom Domain (Ngrok Paid)

If you have a paid ngrok plan with custom domains:

```yaml
# ngrok.yml
tunnels:
  backend:
    proto: http
    addr: 8000
    domain: api.yourdomain.com
    
  frontend:
    proto: http
    addr: 5173
    domain: app.yourdomain.com
```

### Basic Authentication

Add password protection to your ngrok tunnels:

```yaml
# ngrok.yml
tunnels:
  backend:
    proto: http
    addr: 8000
    auth: "username:password"
```

## 🧪 Testing Your Deployment

### 1. Test Backend API

```bash
curl https://YOUR-BACKEND-URL.ngrok-free.app/api/products/
```

Expected: JSON response with product list

### 2. Test Frontend

Open your frontend ngrok URL in a browser:
```
https://YOUR-FRONTEND-URL.ngrok-free.app
```

### 3. Test Full Flow

1. Browse products
2. Add items to cart
3. Login/Register
4. Complete checkout
5. Verify images load correctly

## 🐛 Troubleshooting

### Issue: "ngrok not found"

**Solution:**
```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Or download from https://ngrok.com/download
```

### Issue: "Invalid authtoken"

**Solution:**
1. Get your token from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Update `ngrok.yml` with the correct token
3. Or run: `ngrok config add-authtoken YOUR_TOKEN`

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify backend ngrok URL is correct in `.env.local`
2. Make sure URL includes `/api` at the end
3. Check browser console for CORS errors
4. Restart frontend after updating `.env.local`

### Issue: CORS errors in browser

**Solution:**
The backend is already configured to accept ngrok domains. If you still see errors:

1. Check the Origin header in browser DevTools
2. Verify the ngrok URL matches exactly
3. Restart backend: `docker-compose restart backend`

### Issue: "ERR_NGROK_3200" or tunnel errors

**Solution:**
- Free ngrok accounts have limits (1 tunnel at a time on free tier)
- Upgrade to paid plan for multiple simultaneous tunnels
- Or use separate ngrok instances

### Issue: Images not loading

**Solution:**
Images are served from the backend. Make sure:
1. Backend ngrok tunnel is running
2. Products have correct image paths
3. Check browser Network tab for 404 errors

### Issue: Payment (eSewa) not working

**Solution:**
eSewa callbacks need to point to your ngrok URL:
1. Update eSewa merchant settings with ngrok URL
2. Or use eSewa sandbox for testing
3. Note: Ngrok URLs change on restart (free tier)

## 🔒 Security Considerations

> [!WARNING]
> **Important Security Notes:**

- 🌐 Ngrok URLs are **publicly accessible** - anyone with the URL can access your app
- 🔑 Free tier URLs change every time you restart ngrok
- ⏰ Free tier sessions expire after 2 hours of inactivity
- 🔐 Consider adding basic auth for sensitive deployments

### Recommended Security Measures

1. **Enable Authentication:**
   ```yaml
   # In ngrok.yml
   auth: "username:strong-password"
   ```

2. **Use HTTPS Only:**
   Ngrok provides HTTPS by default - always use it

3. **Monitor Access:**
   Check ngrok dashboard at `http://localhost:4040` for request logs

4. **Temporary Use:**
   Use ngrok for demos, testing, or temporary access only

5. **Production Deployment:**
   For production, use proper cloud hosting (AWS, DigitalOcean, Heroku)

## 📊 Ngrok Web Interface

Access the ngrok inspector at [http://localhost:4040](http://localhost:4040)

Features:
- 📈 Real-time request inspection
- 🔍 Request/response details
- 🔄 Replay requests
- 📊 Traffic statistics

## 💡 Tips & Best Practices

### 1. Keep Ngrok Running

Ngrok must stay running for your app to be accessible. Don't close the terminal!

### 2. Share Your URLs

Share the **frontend** ngrok URL with others:
```
https://abc123.ngrok-free.app
```

They don't need the backend URL - the frontend handles API calls.

### 3. Update URLs After Restart

Free tier URLs change on restart. Remember to:
1. Update `.env.local` with new backend URL
2. Restart frontend
3. Share new frontend URL

### 4. Use Paid Plan for Stability

Ngrok paid plans offer:
- ✅ Custom domains (URLs don't change)
- ✅ Multiple simultaneous tunnels
- ✅ No session timeouts
- ✅ Better performance

### 5. Test Locally First

Always test your app works locally before deploying with ngrok.

## 🔄 Stopping Ngrok

Press `Ctrl+C` in the terminal running ngrok, or:

```bash
# Kill all ngrok processes
pkill ngrok
```

## 📚 Additional Resources

- [Ngrok Documentation](https://ngrok.com/docs)
- [Ngrok Dashboard](https://dashboard.ngrok.com)
- [MediNest README](./README.md)
- [Docker Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review ngrok logs at `http://localhost:4040`
3. Check browser console for errors
4. Verify all services are running: `docker-compose ps`

---

**Happy Deploying! 🚀**

Your MediNest app is now accessible from anywhere in the world!
