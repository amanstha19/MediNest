#!/bin/bash

# MediNest Hybrid Deployment Script
# Backend: Ngrok (Static Domain)
# Frontend: Localtunnel (Random Domain)

set -e

echo "🚀 Starting MediNest Hybrid Deployment..."
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ Error: ngrok is not installed${NC}"
    exit 1
fi

# Check for npm/npx
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx (Node.js) is not installed${NC}"
    exit 1
fi

# Cleanup previous processes
pkill -f "ngrok" || true
pkill -f "localtunnel" || true

# Check services
echo "🔍 Checking services..."
if ! curl -s http://localhost:8000/api/products/ > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend not ready at :8000${NC}"
fi
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Frontend not ready at :5173${NC}"
fi

echo ""
echo "=========================================="
echo "1️⃣  Starting Backend Tunnel (Ngrok)..."

# Start Ngrok (Backend)
nohup ngrok http 8000 --domain=childless-jimmy-tactlessly.ngrok-free.dev > ngrok.log 2>&1 &
NGROK_PID=$!
sleep 5

# Verify Ngrok
BACKEND_URL="https://childless-jimmy-tactlessly.ngrok-free.dev"
if curl -s http://localhost:4040/api/tunnels | grep -q "${BACKEND_URL}"; then
    echo -e "${GREEN}✅ Backend online: ${BACKEND_URL}${NC}"
else
    echo -e "${RED}❌ Backend tunnel failed. Check ngrok.log${NC}"
fi

echo ""
echo "=========================================="
echo "2️⃣  Starting Frontend Tunnel (Localtunnel)..."

# Start Localtunnel (Frontend)
nohup npx -y localtunnel --port 5173 > lt.log 2>&1 &
LT_PID=$!

echo "⏳ Waiting for Localtunnel URL..."
sleep 5
# Extract URL from log (retry a few times if needed)
count=0
while [ $count -lt 10 ]; do
    FRONTEND_URL=$(grep -o "https://.*\.loca\.lt" lt.log | head -n 1)
    if [ ! -z "$FRONTEND_URL" ]; then
        break
    fi
    sleep 2
    ((count++))
done

if [ ! -z "$FRONTEND_URL" ]; then
    echo -e "${GREEN}✅ Frontend online: ${FRONTEND_URL}${NC}"
else
    echo -e "${RED}❌ Frontend tunnel failed. Check lt.log${NC}"
    FRONTEND_URL="http://localhost:5173 (Tunnel Failed)"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}🌐 Deployment Active!${NC}"
echo "=========================================="
echo ""
echo -e "📱 ${GREEN}Frontend App:${NC}  ${FRONTEND_URL}"
echo "   (Open this link and input the password prompt if asked)"
echo ""
echo -e "🔌 ${GREEN}Backend API:${NC}   ${BACKEND_URL}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT STEPS:"
echo "1. If opening Frontend URL shows a 'friendly reminder' page:"
echo "   - Click 'Click to Continue' or enter the tunnel password."
echo "   - Tunnel Password is your IP: $(curl -s https://loca.lt/mytunnelpassword)"
echo ""
echo "2. Ensure .env.local points to the backend:"
echo "   VITE_API_URL=${BACKEND_URL}/api"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all tunnels"

wait
