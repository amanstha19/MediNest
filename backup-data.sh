#!/bin/bash
# MediNest Data Backup Script
# Run this to backup all your data

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Backing up database..."
docker exec medinest-db-1 pg_dump -U drf_user -d drf_pharmacy > $BACKUP_DIR/db_backup_$DATE.sql

echo "Backing up static files..."
docker cp medinest-backend-1:/app/epharm/static/images $BACKUP_DIR/images_$DATE 2>/dev/null || echo "No images to backup"

echo "Backup complete: $BACKUP_DIR/db_backup_$DATE.sql"
echo "To restore: docker exec -i medinest-db-1 psql -U drf_user -d drf_pharmacy < $BACKUP_DIR/db_backup_$DATE.sql"
