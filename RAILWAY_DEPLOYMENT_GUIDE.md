# Railway Deployment Guide - MediNest Backend

## Prerequisites
1. Railway account (free tier available at https://railway.app)
2. GitHub account with your code pushed
3. Railway CLI installed (optional but recommended)

## Step 1: Push Code to GitHub

Make sure all your code is committed and pushed:
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin master
```

## Step 2: Create Railway Project

### Option A: Via Railway Dashboard (Easiest)
1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect the `railway.toml` configuration

### Option B: Via Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Link to GitHub repo
railway link
```

## Step 3: Add PostgreSQL Database

1. In Railway dashboard, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically:
   - Create the database
   - Set `DATABASE_URL` environment variable
   - Connect it to your app

## Step 4: Configure Environment Variables

In Railway dashboard → Your Project → Variables, add these:

### Required Variables:
```env
# Django
DJANGO_SECRET_KEY=your-random-secret-key-here-change-this-in-production
DJANGO_SETTINGS_MODULE=epharm.settings_prod
DEBUG=False

# Database (Railway auto-sets this, but verify)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Email (Gmail SMTP)
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@medinest.com

# Payment (eSewa)
ESEWA_SECRET_KEY=your-esewa-secret-key

# AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# CORS - Add your Vercel frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
```

### Optional Variables:
```env
# For debugging
LOG_LEVEL=INFO

# Redis (if using Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}
```

## Step 5: Deploy

Railway will auto-deploy when you push to GitHub. To deploy manually:
- Click **"Deploy"** in the Railway dashboard

## Step 6: Get Backend URL

After deployment:
1. Go to your project in Railway dashboard
2. Click on your service
3. Look for the **"Domain"** section
4. Copy the URL (e.g., `https://medinest-backend.up.railway.app`)

## Step 7: Update Vercel Frontend

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to your Railway URL:
   ```
   https://your-railway-app.up.railway.app
   ```
3. **Redeploy** the frontend

## Step 8: Verify Deployment

Test these endpoints:
```bash
# Health check
curl https://your-railway-app.up.railway.app/api/products/

# Should return JSON with products
```

## Troubleshooting

### Issue: Build fails
- Check logs in Railway dashboard
- Verify `railway.toml` is in root directory
- Ensure `Dockerfile.railway` exists in `backend_easyhealth/`

### Issue: Database connection fails
- Verify PostgreSQL addon is added
- Check `DATABASE_URL` is set correctly
- Run migrations manually in Railway shell:
  ```bash
  cd backend_easyhealth/epharm
  python manage.py migrate
  ```

### Issue: Static files not loading
- Already configured in `Dockerfile.railway` with whitenoise
- Run `collectstatic` manually if needed:
  ```bash
  cd backend_easyhealth/epharm
  python manage.py collectstatic --noinput
  ```

### Issue: CORS errors
- Add your Vercel frontend URL to `FRONTEND_URL` env variable
- Or modify `settings_prod.py` to include your domain in `CORS_ALLOWED_ORIGINS`

## Files Used for Deployment
- `railway.toml` - Railway configuration
- `backend_easyhealth/Dockerfile.railway` - Docker build instructions
- `backend_easyhealth/epharm/settings_prod.py` - Production settings

## Next Steps After Deployment
1. Create superuser for admin access:
   ```bash
   cd backend_easyhealth/epharm
   python manage.py createsuperuser
   ```
2. Seed initial data (categories, products)
3. Set up monitoring in Railway dashboard
4. Configure custom domain (optional)

## Support
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
