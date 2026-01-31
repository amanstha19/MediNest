# Category & Product Management Fix Plan

## Problem Analysis

- `Product.category` uses hardcoded CharField choices (NOT real-world pattern)
- Separate `Category` model exists but is NOT connected to Products
- Frontend uses hardcoded categories instead of fetching from API

## Solution: Real-World E-commerce Pattern

### Step 1: Update Product Model

- Change `category` from CharField to ForeignKey to Category model
- Keep `category_value` as a property for display

### Step 2: Update Admin Configuration

- Make Category admin fully functional
- Make Product admin fields editable inline
- Allow category management from admin

### Step 3: Update Serializers

- Include full category details in ProductSerializer
- Update CategorySerializer to include product count

### Step 4: Update Views

- Product search/filter to work with ForeignKey
- Category endpoint ready for frontend consumption

### Step 5: Update Frontend

- Fetch categories from `/api/categories/` endpoint
- Remove hardcoded categories array
- Dynamic category dropdown in MedicinesPage

### Step 6: Data Migration

- Create migration to populate Category table from Product data
- Set ForeignKey relationships

## Files to Modify

1. `backend_easyhealth/epharm/myapp/models.py` - Change Product.category
2. `backend_easyhealth/epharm/myapp/admin.py` - Update admin configs
3. `backend_easyhealth/epharm/myapp/serializers.py` - Update serializers
4. `backend_easyhealth/epharm/myapp/views/products.py` - Update views
5. `frontend_easyhealth/src/components/screens/MedicinesPage.jsx` - Fetch categories
6. Create new migration file

## Commands to Run

```bash
cd backend_easyhealth/epharm
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # if needed
```
