#!/bin/bash

# MediNest Restore Script
# This script restores database, product images, and all critical data from backup
# Usage: ./restore-medinest.sh [backup_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${HOME}/MediNest-Backups"
BACKUP_NAME="${1:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MediNest Restore System${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backup name is provided
if [ -z "$BACKUP_NAME" ]; then
    echo -e "${YELLOW}📚 Available Backups:${NC}"
    ls -1 "${BACKUP_DIR}" 2>/dev/null | grep -E "^backup_" | nl || echo "   No backups found"
    echo ""
    echo -e "${YELLOW}Usage: ./restore-medinest.sh <backup_name>${NC}"
    echo -e "${YELLOW}Example: ./restore-medinest.sh backup_20250115_143022${NC}"
    exit 1
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Check if backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    # Try to extract from archive
    if [ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ]; then
        echo -e "${YELLOW}📦 Extracting backup archive...${NC}"
        cd "${BACKUP_DIR}"
        tar -xzf "${BACKUP_NAME}.tar.gz"
        echo -e "${GREEN}✅ Archive extracted${NC}"
    else
        echo -e "${RED}❌ Backup not found: ${BACKUP_NAME}${NC}"
        echo -e "${YELLOW}Available backups:${NC}"
        ls -1 "${BACKUP_DIR}" 2>/dev/null | grep -E "^backup_" | nl || echo "   No backups found"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Found backup: ${BACKUP_PATH}${NC}"

# Show backup info if available
if [ -f "${BACKUP_PATH}/backup_info.txt" ]; then
    echo ""
    echo -e "${BLUE}📋 Backup Information:${NC}"
    cat "${BACKUP_PATH}/backup_info.txt"
    echo ""
fi

# Confirm restore
echo -e "${RED}⚠️  WARNING: This will REPLACE current data with backup data!${NC}"
echo -e "${YELLOW}Current database and images will be overwritten.${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Restore cancelled.${NC}"
    exit 0
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running! Please start Docker first.${NC}"
    exit 1
fi

# Stop containers
echo ""
echo -e "${BLUE}🛑 Stopping containers...${NC}"
docker compose down
echo -e "${GREEN}✅ Containers stopped${NC}"

# Restore Database
echo ""
echo -e "${BLUE}💾 Restoring Database...${NC}"
if [ -f "${BACKUP_PATH}/database_backup.sql" ]; then
    # Start only database container
    docker compose up -d db
    sleep 5
    
    # Wait for database to be ready
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    until docker compose exec -T db pg_isready -U drf_user > /dev/null 2>&1; do
        sleep 2
    done
    
    # Restore database
    docker compose exec -T db psql -U drf_user -d postgres -c "DROP DATABASE IF EXISTS drf_pharmacy;" 2>/dev/null || true
    docker compose exec -T db psql -U drf_user -d postgres -c "CREATE DATABASE drf_pharmacy;" 2>/dev/null || true
    docker compose exec -T db psql -U drf_user drf_pharmacy < "${BACKUP_PATH}/database_backup.sql"
    echo -e "${GREEN}✅ Database restored${NC}"
else
    echo -e "${YELLOW}⚠️  Database backup not found, skipping...${NC}"
fi

# Restore Product Images
echo ""
echo -e "${BLUE}🖼️  Restoring Product Images...${NC}"
if [ -d "${BACKUP_PATH}/product_images" ]; then
    mkdir -p backend_easyhealth/epharm/static/images/products
    rm -rf backend_easyhealth/epharm/static/images/products/*
    cp -r "${BACKUP_PATH}/product_images/"* backend_easyhealth/epharm/static/images/products/ 2>/dev/null || true
    IMAGE_COUNT=$(ls -1 backend_easyhealth/epharm/static/images/products/*.jpg 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ Restored ${IMAGE_COUNT} product images${NC}"
else
    echo -e "${YELLOW}⚠️  Product images backup not found${NC}"
fi

# Restore Prescription Images
echo ""
echo -e "${BLUE}📄 Restoring Prescription Images...${NC}"
if [ -d "${BACKUP_PATH}/prescription_images" ]; then
    mkdir -p backend_easyhealth/epharm/static/images/prescriptions
    rm -rf backend_easyhealth/epharm/static/images/prescriptions/*
    cp -r "${BACKUP_PATH}/prescription_images/"* backend_easyhealth/epharm/static/images/prescriptions/ 2>/dev/null || true
    echo -e "${GREEN}✅ Prescription images restored${NC}"
else
    echo -e "${YELLOW}⚠️  Prescription images backup not found${NC}"
fi

# Restore Verification Images
echo ""
echo -e "${BLUE}✓ Restoring Verification Images...${NC}"
if [ -d "${BACKUP_PATH}/verification_images" ]; then
    mkdir -p backend_easyhealth/epharm/static/images/prescription_verifications
    rm -rf backend_easyhealth/epharm/static/images/prescription_verifications/*
    cp -r "${BACKUP_PATH}/verification_images/"* backend_easyhealth/epharm/static/images/prescription_verifications/ 2>/dev/null || true
    echo -e "${GREEN}✅ Verification images restored${NC}"
else
    echo -e "${YELLOW}⚠️  Verification images backup not found${NC}"
fi

# Restore Environment File
echo ""
echo -e "${BLUE}🔐 Restoring Environment File...${NC}"
if [ -f "${BACKUP_PATH}/.env.backup" ]; then
    cp "${BACKUP_PATH}/.env.backup" backend_easyhealth/epharm/.env
    echo -e "${GREEN}✅ Environment file restored${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file backup not found${NC}"
fi

# Start all containers
echo ""
echo -e "${BLUE}🚀 Starting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Containers started${NC}"

# Run migrations (in case of version differences)
echo ""
echo -e "${BLUE}🔄 Running migrations...${NC}"
sleep 5
docker compose exec backend python epharm/manage.py migrate --noinput || echo -e "${YELLOW}⚠️  Migration warning (may be normal)${NC}"

# Collect static files
echo ""
echo -e "${BLUE}📦 Collecting static files...${NC}"
docker compose exec backend python epharm/manage.py collectstatic --noinput || echo -e "${YELLOW}⚠️  Static files warning (may be normal)${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Restore Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}🌐 Your application is now running at:${NC}"
echo -e "   Frontend: http://localhost:5173"
echo -e "   Backend:  http://localhost:8000"
echo -e "   Admin:    http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}💡 Verify your data:${NC}"
echo -e "   - Check products: http://localhost:5173/medicines"
echo -e "   - Check admin: http://localhost:8000/admin/myapp/product/"
echo ""
