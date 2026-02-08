# Docker Migration Setup - MEDINEST

## Overview
The Docker setup has been updated to automatically run Django migrations when the container starts. This ensures the database is always up-to-date with the latest models.

## Changes Made

### 1. New Entrypoint Script
**File:** `backend_easyhealth/entrypoint.sh`

This script runs automatically when the container starts:
```bash
#!/bin/bash
set -e

echo "🔄 Running database migrations..."
cd /app/epharm
python manage.py migrate --noinput

echo "✅ Migrations complete!"
echo "🚀 Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000
```

### 2. Updated Dockerfile
**File:** `backend_easyhealth/Dockerfile`

Changes:
- Added `RUN chmod +x /app/entrypoint.sh` to make script executable
- Changed from `CMD` to `ENTRYPOINT` to use the entrypoint script
- Removed hardcoded `command` (now handled by entrypoint)

### 3. Updated docker-compose.yml
**File:** `docker-compose.yml`

Changes:
- Removed `command: python manage.py runserver 0.0.0.0:8000` (now handled by Dockerfile ENTRYPOINT)
- Updated volume paths to match new working directory structure (`/app/epharm`)

## How It Works

1. **Container Build:**
   ```bash
   docker-compose build backend
   ```

2. **Container Start:**
   ```bash
   docker-compose up backend
   ```

3. **Automatic Process:**
   - Container starts
   - Entrypoint script executes
   - Runs `python manage.py migrate --noinput`
   - Starts Django development server
   - Server ready at http://localhost:8000

## Benefits

✅ **No Manual Migrations:** Migrations run automatically on container start  
✅ **Fresh Database:** New containers always have latest schema  
✅ **CI/CD Ready:** Perfect for automated deployments  
✅ **Developer Friendly:** No need to run `migrate` command manually  

## Usage

### Start All Services
```bash
docker-compose up -d
```

### View Migration Output
```bash
docker-compose logs -f backend
```

### Manual Migration (if needed)
```bash
docker-compose exec backend python epharm/manage.py migrate
```

### Create New Migration
```bash
docker-compose exec backend python epharm/manage.py makemigrations
```

## Troubleshooting

### Issue: Migrations not running
**Solution:** Check logs
```bash
docker-compose logs backend
```

### Issue: Permission denied on entrypoint.sh
**Solution:** Rebuild container
```bash
docker-compose build --no-cache backend
docker-compose up -d
```

### Issue: Database not ready
**Solution:** Add health check (for production)
```yaml
# In docker-compose.yml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U drf_user -d drf_pharmacy"]
      interval: 5s
      timeout: 5s
      retries: 5
  
  backend:
    depends_on:
      db:
        condition: service_healthy
```

## Production Considerations

For production deployment, consider:

1. **Separate Migration Job:**
   ```yaml
   # Add to docker-compose.prod.yml
   migration:
     build: ./backend_easyhealth/
     command: python epharm/manage.py migrate --noinput
     depends_on:
       - db
   ```

2. **Health Checks:**
   ```yaml
   backend:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
       interval: 30s
       timeout: 10s
       retries: 3
   ```

3. **Database Backup:**
   ```bash
   # Before migrations in production
   docker-compose exec db pg_dump -U drf_user drf_pharmacy > backup.sql
   ```

## Files Modified

- ✅ `backend_easyhealth/entrypoint.sh` (NEW)
- ✅ `backend_easyhealth/Dockerfile` (MODIFIED)
- ✅ `docker-compose.yml` (MODIFIED)

## Next Steps

1. Rebuild the backend container:
   ```bash
   docker-compose down
   docker-compose build --no-cache backend
   docker-compose up -d
   ```

2. Verify migrations ran:
   ```bash
   docker-compose logs backend | grep -E "(migrations|migrate)"
   ```

3. Test the application:
   ```bash
   curl http://localhost:8000/api/health/
   ```

## Support

For issues with Docker migrations:
1. Check container logs: `docker-compose logs backend`
2. Verify database connection: `docker-compose exec backend python epharm/manage.py dbshell`
3. Check migration status: `docker-compose exec backend python epharm/manage.py showmigrations`
