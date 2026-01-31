# Category Matching Fix - TODO

## Goal

Ensure frontend categories match backend categories exactly with modern Lucide React icons.

## Backend Categories (from Category model)

- OTC - Over-the-Counter (icon: Pill)
- RX - Prescription Medicines (icon: Syringe)
- SUP - Vitamins & Supplements (icon: FlaskConical)
- WOM - Women's Health (icon: HeartPulse)
- MEN - Men's Health (icon: Activity)
- PED - Pediatric Medicines (icon: Baby)
- HERB - Herbal & Ayurvedic (icon: Leaf)
- DIAG - Medical Devices (icon: Monitor)
- FIRST - First Aid (icon: FirstAid)

## Tasks

### Task 1: Create seed categories migration ✅

- [x] Created `0036_seed_categories.py` to seed all categories with modern icon names (Lucide icon names)

### Task 2: Update HomeScreen.jsx ✅

- [x] Fetch categories from `/api/categories/` endpoint
- [x] Use fetched categories instead of hardcoded CATEGORIES array
- [x] Added getIconComponent helper function for Lucide icon lookup
- [x] Updated renderIcon to use Lucide React icons
- [x] Maintained fallback to FALLBACK_CATEGORIES if API fails

### Task 3: Update FALLBACK_CATEGORIES ✅

- [x] Changed frontend categories to match backend exactly
- [x] Using modern Lucide React icon names instead of emojis

## Files Modified

1. `backend_easyhealth/epharm/myapp/migrations/0036_seed_categories.py` - Seed migration with Lucide icon names
2. `frontend_easyhealth/src/components/screens/HomeScreen.jsx` - Uses Lucide React icons

## Commands to Run

```bash
cd backend_easyhealth/epharm
python3 manage.py migrate
```
