# Render Deployment Guide - MediNest Backend

Great choice! Render is excellent for Django deployments. You already have `render.yaml` configured.

## Prerequisites
1. Render account (free tier available at https://render.com)
2. GitHub account with your code pushed to master branch
3. Your repository: https://github.com/amanstha19/MediNest

## Step 1: Push Code to GitHub

Make sure all your code is committed and pushed to master:
```bash
cd /Users/amanshrestha/Desktop/MediNest
git status
```

If you have uncommitted changes:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

## Step 2: Deploy to Render (Blueprints - Easiest Method)

Render can auto-deploy using your `render.yaml` file:

1. Go to https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect your GitHub account if not already connected
4. Select your **MediNest** repository
5. Render will read the `render.yaml` and show you:
   - Web Service: medinest-backend
   - Database: medinest-db (PostgreSQL)
6. Click **"Apply"**
7. Render will automatically:
   - Create the PostgreSQL database
   - Deploy your Django backend
   - Set all environment variables
   - Run migrations

## Step 3: Wait for Deployment

- Database creation: ~2-3 minutes
- Backend deployment: ~5-10 minutes
- You can watch the logs in real-time

## Step 4: Add Additional Environment Variables

After deployment, go to your service in Render dashboard:

1. Click on **medinest-backend** service
2. Go to **Environment** tab
3. Add these variables:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=noreply@medinest.com

# Payment (eSewa)
ESEWA_SECRET_KEY=your-esewa-secret-key

# AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# CORS - Your Vercel frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
```

**Note**: For Gmail, you need an "App Password" not your regular password. Generate one at: https://myaccount.google.com/apppasswords

## Step 5: Get Your Backend URL

After successful deployment:
1. Go to your service dashboard
2. Copy the URL (e.g., `https://medinest-backend.onrender.com`)

## Step 6: Update Vercel Frontend

1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL` to your Render URL:
   ```
   https://medinest-backend.onrender.com
   ```
5. **Redeploy** the frontend

## Step 7: Verify Everything Works

Test these endpoints:
```bash
curl https://your-render-url.onrender.com/api/products/
curl https://your-render-url.onrender.com/api/categories/
```

## Troubleshooting

### Issue: Build fails
- Check logs in Render dashboard
- Verify `Dockerfile` exists in root directory
- Ensure `render.yaml` is valid

### Issue: Database connection fails
- Check if PostgreSQL database is created
- Verify environment variables are set correctly
- Render auto-sets these from the blueprint

### Issue: Static files not loading
- Already configured with whitenoise in Dockerfile
- Run `collectstatic` manually if needed in Render shell

### Issue: CORS errors
- Add your Vercel frontend URL to `FRONTEND_URL` env variable
- Or modify `settings_prod.py` to include your domain

## Alternative: Manual Deploy (Without Blueprints)

If Blueprint doesn't work:

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Select **master** branch
5. Configure:
   - **Name**: medinest-backend
   - **Runtime**: Docker
   - **Dockerfile Path**: ./Dockerfile
   - **Plan**: Free
6. Add environment variables manually (see Step 4)
7. Create **PostgreSQL** database separately
8. Deploy

## Files Used
- `render.yaml` - Render Blueprint configuration
- `Dockerfile` - Docker build instructions
- `backend_easyhealth/epharm/settings_prod.py` - Production settings

## Next Steps
1. Create superuser for admin:
   ```bash
   # In Render dashboard, click "Shell" tab
   cd backend_easyhealth/epharm
   python manage.py createsuperuser
   ```
2. Seed initial data if needed
3. Set up monitoring

## Support
- Render Docs: https://render.com/docs
- Render Discord: https://render.com/discord
