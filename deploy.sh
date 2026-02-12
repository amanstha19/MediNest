#!/bin/bash

# MediNest Quick Deployment Script
# This script helps prepare your project for deployment

echo "🚀 MediNest Deployment Preparation"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Git not initialized. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${GREEN}✅ Git already initialized${NC}"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes found${NC}"
    read -p "Commit changes? (y/n): " commit_changes
    if [ "$commit_changes" = "y" ]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  No GitHub remote found${NC}"
    echo "Please add your GitHub repository:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/MediNest.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
else
    echo -e "${GREEN}✅ GitHub remote configured${NC}"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote: $REMOTE_URL"
fi

echo ""
echo -e "${GREEN}📋 Deployment Checklist:${NC}"
echo "===================================="
echo ""
echo "1. ✅ Production settings created (settings_prod.py)"
echo "2. ✅ Railway configuration created (railway.toml)"
echo "3. ✅ Vercel configuration created (vercel.json)"
echo "4. ✅ API config updated for production"
echo "5. ✅ Deployment guide created (DEPLOYMENT_GUIDE.md)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "==========="
echo ""
echo "1. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - New Project → Deploy from GitHub"
echo "   - Add PostgreSQL database"
echo "   - Configure environment variables"
echo ""
echo "3. Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repo"
echo "   - Set VITE_API_URL to your Railway backend URL"
echo ""
echo "4. Update Railway environment variables with your Vercel URL"
echo ""
echo -e "${GREEN}📖 Full instructions in DEPLOYMENT_GUIDE.md${NC}"
echo ""
echo "🎉 Your MediNest app will be live at:"
echo "   Frontend: https://your-app.vercel.app"
echo "   Backend:  https://your-app.up.railway.app"
echo ""
