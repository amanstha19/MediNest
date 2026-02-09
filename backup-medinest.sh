#!/bin/bash

# MediNest Complete Backup Script
# This script backs up database, product images, and all critical data
# Usage: ./backup-medinest.sh [backup_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${HOME}/MediNest-Backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${1:-backup_${TIMESTAMP}}"
CURRENT_BACKUP="${BACKUP_DIR}/${BACKUP_NAME}"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MediNest Backup System${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create backup directory
mkdir -p "${CURRENT_BACKUP}"

echo -e "${YELLOW}📁 Backup location: ${CURRENT_BACKUP}${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running! Please start Docker first.${NC}"
    exit 1
fi

# Check if containers are running
echo -e "${BLUE}🔍 Checking containers...${NC}"
if docker compose ps | grep -q "medinest-db-1"; then
    echo -e "${GREEN}✅ Database container is running${NC}"
    DB_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Database container is not running${NC}"
    DB_RUNNING=false
fi

# 1. Backup Database
echo ""
echo -e "${BLUE}💾 Backing up PostgreSQL Database...${NC}"
if [ "$DB_RUNNING" = true ]; then
    docker compose exec -T db pg_dump -U drf_user drf_pharmacy > "${CURRENT_BACKUP}/database_backup.sql"
    echo -e "${GREEN}✅ Database backup complete: database_backup.sql${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping database backup (container not running)${NC}"
fi

# 2. Backup Product Images
echo ""
echo -e "${BLUE}🖼️  Backing up Product Images...${NC}"
if [ -d "backend_easyhealth/epharm/static/images/products" ]; then
    cp -r backend_easyhealth/epharm/static/images/products "${CURRENT_BACKUP}/product_images"
    IMAGE_COUNT=$(ls -1 backend_easyhealth/epharm/static/images/products/*.jpg 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ Backed up ${IMAGE_COUNT} product images${NC}"
else
    echo -e "${YELLOW}⚠️  Product images directory not found${NC}"
fi

# 3. Backup Prescription Images
echo ""
echo -e "${BLUE}📄 Backing up Prescription Images...${NC}"
if [ -d "backend_easyhealth/epharm/static/images/prescriptions" ]; then
    cp -r backend_easyhealth/epharm/static/images/prescriptions "${CURRENT_BACKUP}/prescription_images"
    echo -e "${GREEN}✅ Prescription images backed up${NC}"
else
    echo -e "${YELLOW}⚠️  Prescription images directory not found${NC}"
fi

# 4. Backup Verification Images
echo ""
echo -e "${BLUE}✓ Backing up Verification Images...${NC}"
if [ -d "backend_easyhealth/epharm/static/images/prescription_verifications" ]; then
    cp -r backend_easyhealth/epharm/static/images/prescription_verifications "${CURRENT_BACKUP}/verification_images"
    echo -e "${GREEN}✅ Verification images backed up${NC}"
else
    echo -e "${YELLOW}⚠️  Verification images directory not found${NC}"
fi

# 5. Backup Environment Files
echo ""
echo -e "${BLUE}🔐 Backing up Environment Files...${NC}"
if [ -f "backend_easyhealth/epharm/.env" ]; then
    cp backend_easyhealth/epharm/.env "${CURRENT_BACKUP}/.env.backup"
    echo -e "${GREEN}✅ Environment file backed up${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file not found${NC}"
fi

# 6. Create Product Data JSON Export
echo ""
echo -e "${BLUE}📋 Exporting Product Data to JSON...${NC}"
if [ "$DB_RUNNING" = true ]; then
    docker compose exec -T backend python epharm/manage.py dumpdata myapp.Product --indent 2 > "${CURRENT_BACKUP}/products.json" 2>/dev/null || echo "[]" > "${CURRENT_BACKUP}/products.json"
    docker compose exec -T backend python epharm/manage.py dumpdata myapp.Category --indent 2 > "${CURRENT_BACKUP}/categories.json" 2>/dev/null || echo "[]" > "${CURRENT_BACKUP}/categories.json"
    echo -e "${GREEN}✅ Product and category data exported${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping JSON export (container not running)${NC}"
fi

# 7. Create Backup Info File
echo ""
echo -e "${BLUE}📝 Creating backup information...${NC}"
cat > "${CURRENT_BACKUP}/backup_info.txt" << EOF
MediNest Backup Information
===========================
Backup Name: ${BACKUP_NAME}
Created: $(date)
Docker Running: ${DB_RUNNING}
Backup Contents:
- Database: database_backup.sql
- Product Images: product_images/
- Prescription Images: prescription_images/
- Verification Images: verification_images/
- Environment: .env.backup
- Product Data: products.json
- Category Data: categories.json

Restore Instructions:
1. Stop containers: docker compose down
2. Restore database: docker compose exec -T db psql -U drf_user drf_pharmacy < database_backup.sql
3. Restore images: Copy folders back to backend_easyhealth/epharm/static/images/
4. Start containers: docker compose up -d

Or use: ./restore-medinest.sh ${BACKUP_NAME}
EOF

echo -e "${GREEN}✅ Backup info created${NC}"

# 8. Create Compressed Archive
echo ""
echo -e "${BLUE}📦 Creating compressed archive...${NC}"
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
echo -e "${GREEN}✅ Archive created: ${BACKUP_NAME}.tar.gz${NC}"

# 9. Calculate Backup Size
BACKUP_SIZE=$(du -sh "${CURRENT_BACKUP}" | cut -f1)
ARCHIVE_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Backup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}Backup Name:${NC} ${BACKUP_NAME}"
echo -e "${BLUE}Location:${NC} ${CURRENT_BACKUP}"
echo -e "${BLUE}Archive:${NC} ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo -e "${BLUE}Backup Size:${NC} ${BACKUP_SIZE}"
echo -e "${BLUE}Archive Size:${NC} ${ARCHIVE_SIZE}"
echo ""
echo -e "${YELLOW}💡 To restore, run:${NC}"
echo -e "   ./restore-medinest.sh ${BACKUP_NAME}"
echo ""

# List all backups
echo -e "${BLUE}📚 All Available Backups:${NC}"
ls -lh "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}' || echo "   No archives found"
