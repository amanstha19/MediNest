# 📸 Real Medicine Photos Guide

## The ONLY Way to Get Real Medicine Box/Bottle Photos

Due to copyright restrictions, **APIs cannot provide real medicine brand photos**. You must download them manually from Google Images.

---

## 🚀 Quick Method (15-20 minutes)

### Step 1: Get Product List
Run this to see all products:
```bash
cd backend_easyhealth/epharm
python3 manage.py shell -c "from myapp.models import Product; [print(f'{p.id}: {p.name}') for p in Product.objects.all()]"
```

### Step 2: Create Download Folder
```bash
mkdir -p ~/Downloads/medicine_images
```

### Step 3: Download from Google Images

**For each product:**
1. Go to https://images.google.com
2. Search: `"{product name}" medicine box` or `"{product name}" bottle`
   - Example: `"Paracetamol 500mg" medicine box`
   - Example: `"Vitamin C" supplement bottle`
3. Find a clear photo (box or bottle)
4. Right-click → "Save Image As..."
5. Save as: `{product_id}.jpg` (e.g., `1.jpg`, `2.jpg`, etc.)

**Priority Products (Download these first):**
- 1: Paracetamol 500mg
- 2: Azithromycin 500mg  
- 3: Atorvastatin 10mg
- 4: Vitamin C 500mg
- 5: First Aid Kit
- 6: Digital Thermometer
- 7: Glucometer Kit
- 8: Band-Aid Assorted

### Step 4: Upload to Your Project
Once you've downloaded images, run:
```bash
cd backend_easyhealth/epharm
python3 manage.py upload_manual_images ~/Downloads/medicine_images
```

---

## 📋 Product List with Search Terms

| ID | Product Name | Search Term |
|----|-------------|-------------|
| 1 | Paracetamol 500mg | "paracetamol 500mg" medicine box |
| 2 | Azithromycin 500mg | "azithromycin" antibiotic tablets |
| 3 | Atorvastatin 10mg | "atorvastatin" cholesterol medicine |
| 4 | Vitamin C 500mg | "vitamin c" supplement bottle |
| 5 | Ibuprofen 400mg | "ibuprofen" pain relief tablets |
| 6 | Cetirizine 10mg | "cetirizine" allergy medicine |
| 7 | Digene Tablets | "digene" antacid tablets |
| 8 | Amoxicillin 500mg | "amoxicillin" antibiotic capsules |
| 9 | Diclofenac 50mg | "diclofenac" pain relief |
| 10 | Metformin 500mg | "metformin" diabetes medicine |
| ... | ... | ... |

---

## 🎯 Alternative: Use Generated Images

If you don't have time to download 70 images, use the **generated professional images** I already created:

```bash
cd backend_easyhealth/epharm
python3 manage.py create_medicine_images --replace
```

These show:
- ✅ Product names clearly
- ✅ Category colors
- ✅ Prices and stock
- ✅ Prescription badges

**For FYP defense, generated images are perfectly fine!** Judges care about functionality, not photo realism.

---

## 💡 Pro Tip: Hybrid Approach

Download **real photos for 10-15 popular products only**:
1. Paracetamol
2. Vitamin C
3. First Aid Kit
4. Thermometer
5. Glucometer
6. Band-Aid
7. Dettol
8. Cough Syrup
9. ORS
10. Multivitamin

Keep generated images for the rest. This gives you:
- ✅ Some real photos for demo
- ✅ Fast setup
- ✅ Professional look

---

## Commands Summary

```bash
# 1. List all products
python3 manage.py shell -c "from myapp.models import Product; [print(f'{p.id}: {p.name}') for p in Product.objects.all()]"

# 2. Upload downloaded images
python3 manage.py upload_manual_images ~/Downloads/medicine_images

# 3. Regenerate generated images (if needed)
python3 manage.py create_medicine_images --replace
```

---

## 🎓 For FYP Defense

**What judges actually evaluate:**
- ✅ System features working
- ✅ User interface design
- ✅ Database functionality
- ✅ Payment integration
- ✅ Admin panel

**What they DON'T care about:**
- ❌ Whether product photos are real or generated
- ❌ Photo quality (as long as it's professional)

**Save your time for coding and presentation!** 🚀
