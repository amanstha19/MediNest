# 🚀 MediNest Deployment Guide

Get your MediNest pharmacy application live with Railway + Vercel in minutes!

## 📋 Quick Overview

| Component | Platform | Live URL |
|-----------|----------|----------|
| **Backend API** | Railway | `https://your-app.up.railway.app` |
| **Frontend** | Vercel | `https://your-app.vercel.app` |
| **Database** | Railway PostgreSQL | Included with backend |
| **Media Storage** | Railway Disk | Persistent storage |

---

## 🎯 Step-by-Step Deployment

### Step 1: Push to GitHub

Make sure your code is in a GitHub repository:

```bash
# If not already done
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MediNest.git
git push -u origin main
```

---

### Step 2: Deploy Backend to Railway

#### 2.1 Sign Up & Install
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Install Railway CLI (optional but recommended):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

#### 2.2 Create New Project
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `MediNest` repository
3. Railway will auto-detect the `railway.toml` configuration

#### 2.3 Add PostgreSQL Database
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically connect it to your backend

#### 2.4 Configure Environment Variables
Go to your project → Variables tab, add these:

```env
# Required - Django
DJANGO_SETTINGS_MODULE=epharm.settings_prod
DJANGO_SECRET_KEY=your-super-secret-key-here-change-this-in-production

# Required - Database (Railway auto-fills these, but verify)
POSTGRES_DB=railway
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-railway-password
POSTGRES_HOST=your-railway-host
POSTGRES_PORT=5432

# Required - Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ALLOW_ALL_ORIGINS=False

# Required - Site URL
SITE_URL=https://your-backend.up.railway.app

# Payment Gateway - eSewa Sandbox
ESEWA_SECRET_KEY=your-esewa-secret-key
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_PRODUCT_SERVICE_CHARGE=0
ESEWA_PRODUCT_DELIVERY_CHARGE=0

# Payment Gateway - Khalti (optional)
KHALTI_SECRET_KEY=your-khalti-secret-key
KHALTI_PUBLIC_KEY=your-khalti-public-key

# AI/OCR - Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Email - Gmail SMTP
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@medinest.com

# Optional - Redis (Railway provides this)
REDIS_URL=your-redis-url-if-available
```

#### 2.5 Deploy
1. Railway will auto-deploy on every git push
2. Check the "Deployments" tab for status
3. Once deployed, copy your backend URL (e.g., `https://medinest-api.up.railway.app`)

---

### Step 3: Deploy Frontend to Vercel

#### 3.1 Sign Up
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub

#### 3.2 Import Project
1. Click "Add New Project"
2. Import your `MediNest` repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend_easyhealth`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 3.3 Add Environment Variables
In Project Settings → Environment Variables:

```env
VITE_API_URL=https://your-railway-backend.up.railway.app
```

#### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Copy your frontend URL (e.g., `https://medinest.vercel.app`)

---

### Step 4: Update CORS & Finalize

#### 4.1 Update Railway Environment Variables
Go back to Railway and update:

```env
FRONTEND_URL=https://your-vercel-frontend.vercel.app
CORS_ALLOW_ALL_ORIGINS=False
```

#### 4.2 Redeploy Backend
Railway will auto-redeploy with new CORS settings.

---

## ✅ Verification Checklist

- [ ] Backend API responds: `https://your-backend.up.railway.app/api/products/`
- [ ] Admin panel loads: `https://your-backend.up.railway.app/admin/`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Login works
- [ ] Products display
- [ ] Cart functionality works
- [ ] Payment gateway redirects work

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check if migrations ran
railway run python manage.py migrate
```

**Static Files Not Loading:**
- WhiteNoise is configured - should work automatically
- Check `railway.toml` healthcheck path

**CORS Errors:**
- Verify `FRONTEND_URL` matches your Vercel domain exactly
- Check `CORS_ALLOW_ALL_ORIGINS=False` in production

### Frontend Issues

**API Not Connecting:**
- Verify `VITE_API_URL` in Vercel environment variables
- Check browser console for CORS errors

**Build Fails:**
- Check `vercel.json` configuration
- Ensure `vite.config.js` is correct

---

## 🎨 Custom Domain (Optional)

### Railway Custom Domain
1. Go to Railway → Settings → Domains
2. Add your domain (e.g., `api.medinest.com`)
3. Update DNS with provided records
4. Update `SITE_URL` and `FRONTEND_URL` environment variables

### Vercel Custom Domain
1. Go to Vercel → Project Settings → Domains
2. Add your domain (e.g., `medinest.com`)
3. Update DNS with provided records

---

## 📊 Monitoring & Logs

### Railway
- **Logs**: Railway Dashboard → Deployments → Logs
- **Metrics**: Railway Dashboard → Metrics tab
- **Database**: Railway Dashboard → PostgreSQL → Metrics

### Vercel
- **Logs**: Vercel Dashboard → Project → Functions
- **Analytics**: Vercel Dashboard → Analytics tab

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway and Vercel will auto-deploy!
```

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/4.2/howto/deployment/

---

## 🎉 Success!

Your MediNest pharmacy application is now live! 

**Live URLs:**
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔌 API: `https://your-app.up.railway.app/api/`
- 🔐 Admin: `https://your-app.up.railway.app/admin/`

Share these links with your users! 🚀
