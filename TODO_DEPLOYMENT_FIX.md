# Deployment Fix - Vercel + Ngrok Backend

## Problem
Frontend deployed on Vercel cannot fetch products/categories from backend on ngrok.
Error: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`

## Root Cause
The hardcoded ngrok URL in `proxy-api.js` has expired. When ngrok tunnel is offline, it returns HTML error page instead of JSON.

## Files Modified
- ✅ `frontend_easyhealth/api/proxy-api.js` - Added better error handling, CORS headers, and HTML detection

## Next Steps to Complete Fix

### Step 1: Get Current Ngrok URL
Run one of these commands to get your active ngrok URL:
```bash
# If ngrok is running locally
curl http://localhost:4040/api/tunnels

# Or check your terminal where you started the backend
# Look for: "Forwarding https://xxxx.ngrok-free.dev -> http://localhost:8000"
```

### Step 2: Update Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-current-ngrok-url.ngrok-free.dev` (without `/api` at the end)
5. Click **Save**
6. **Redeploy** your project (Vercel will auto-redeploy)

### Step 3: Verify Backend is Running
Make sure your Django backend is:
- Running locally (`python manage.py runserver` or Docker)
- Connected to ngrok (`ngrok http 8000`)
- Database is migrated and has data

### Step 4: Test the Fix
After redeploy, open browser console and check:
- No more HTML parsing errors
- API calls return JSON
- Products/categories load correctly

## Alternative: Permanent Backend Deployment
For a permanent solution, deploy your backend to:
- **Railway** (recommended - free tier available)
- **Render**
- **PythonAnywhere**

Then update `VITE_API_URL` to the permanent backend URL.

## Troubleshooting
If still not working:
1. Check Vercel Functions logs (Dashboard → Project → Functions)
2. Verify ngrok URL is accessible: `curl https://your-ngrok-url.ngrok-free.dev/api/categories/`
3. Ensure backend has `CORS_ALLOW_ALL_ORIGINS = True` (already set in settings.py)
4. Check that ngrok tunnel is active and not expired
