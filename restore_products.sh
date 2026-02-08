#!/bin/bash
# Restore products to PostgreSQL database

echo "Restoring products to database..."

# Product 1: Tylenol
docker compose exec -T db psql -U drf_user -d drf_pharmacy -c "INSERT INTO myapp_product (id, name, generic_name, description, price, stock, prescription_required, created_at, updated_at) VALUES (5, 'Tylenol', 'Pantoprazole', 'Pantoprazole is a proton pump inhibitor that decreases the amount of acid produced in the stomach.', 10.00, 960, FALSE, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

# Product 2: Amoxil
docker compose exec -T db psql -U drf_user -d drf_pharmacy -c "INSERT INTO myapp_product (id, name, generic_name, description, price, stock, prescription_required, created_at, updated_at) VALUES (6, 'Amoxil', 'Amoxicillin', 'Amoxicillin is used to treat a wide variety of bacterial infections.', 200.00, 1999, FALSE, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

# Product 3: Azistra
docker compose exec -T db psql -U drf_user -d drf_pharmacy -c "INSERT INTO myapp_product (id, name, generic_name, description, price, stock, prescription_required, created_at, updated_at) VALUES (7, 'Azistra', 'Azithromycin', 'Azithromycin is used to treat certain bacterial infections.', 150.00, 222, TRUE, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

# Product 4: Vitamin C
docker compose exec -T db psql -U drf_user -d drf_pharmacy -c "INSERT INTO myapp_product (id, name, generic_name, description, price, stock, prescription_required, created_at, updated_at) VALUES (8, 'Vitamin C', 'Vitamin C', 'Vitamin C helps the body make collagen, a protein that is used to create skin, cartilage, tendons, ligaments, and blood vessels.', 50.00, 898, FALSE, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

echo ""
echo "Restored 4 products!"
echo ""
echo "Current products in database:"
docker compose exec db psql -U drf_user -d drf_pharmacy -c "SELECT id, name, generic_name, price FROM myapp_product ORDER BY id;"
