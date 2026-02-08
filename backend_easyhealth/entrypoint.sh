#!/bin/bash

# Entrypoint script for Django backend with automatic migrations

set -e

echo "=========================================="
echo "MEDINEST Backend - Starting Up"
echo "=========================================="

# Wait for database to be ready (if using external DB)
# Uncomment if needed:
# echo "Waiting for database..."
# sleep 5

# Run migrations automatically
echo ""
echo "🔄 Running database migrations..."
cd /app/epharm
python manage.py migrate --noinput

# Create default superuser if it doesn't exist (optional)
# Uncomment if needed:
# echo ""
# echo "👤 Checking superuser..."
# python manage.py shell -c "
# from django.contrib.auth import get_user_model;
# User = get_user_model();
# if not User.objects.filter(username='admin').exists():
#     User.objects.create_superuser('admin', 'admin@medinest.com', 'admin123');
#     print('Superuser created: admin/admin123');
# else:
#     print('Superuser already exists');
# "

echo ""
echo "✅ Migrations complete!"
echo ""
echo "🚀 Starting Django development server..."
echo "   URL: http://0.0.0.0:8000"
echo ""

# Start the Django server
exec python manage.py runserver 0.0.0.0:8000
