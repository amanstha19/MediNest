# Prescription Verification System

## Overview

Implement a prescription verification system where:

1. Customers upload prescriptions during checkout
2. System extracts NMC number from the prescription using OCR
3. Pharmacist reviews and verifies the prescription in admin panel
4. Order status updates based on verification

## Features

### Frontend (Customer)

- [ ] Prescription upload with drag & drop
- [ ] OCR preview showing extracted NMC number
- [ ] Verification status display in order tracking
- [ ] Notification when prescription is approved/rejected

### Backend (Django)

- [ ] OCR endpoint using Tesseract or Google Vision API
- [ ] NMC number extraction with regex pattern
- [ ] Prescription model with verification fields
- [ ] API endpoints for prescription upload and status

### Admin Panel (Pharmacist)

- [ ] Prescription verification queue
- [ ] View uploaded prescription image
- [ ] Approve/Reject with notes
- [ ] Doctor NMC number verification

## Technical Implementation

### OCR Options:

1. **Tesseract** (free, local) - Python library
2. **Google Vision API** (paid, cloud) - Better accuracy
3. **Azure Computer Vision** (paid, cloud)

### NMC Number Pattern (Nepal):

- Format: NMC-XXXXX or NMC-XXXXX-NP
- Regex: `NMC[-\s]?\d{5}(?:[-\s]?NP)?`

## Files to Create/Modify

### New Files:

- `backend_easyhealth/epharm/myapp/models.py` - PrescriptionVerification model
- `backend_easyhealth/epharm/myapp/views/prescription.py` - OCR & verification views
- `backend_easyhealth/epharm/myapp/urls.py` - New routes
- `frontend_easyhealth/src/components/screens/PrescriptionUpload.jsx` - Upload component
- `frontend_easyhealth/src/components/screens/PrescriptionStatus.jsx` - Status display

### Modified Files:

- `backend_easyhealth/epharm/templates/admin/dashboard.html` - Add verification queue
- `frontend_easyhealth/src/components/screens/CheckoutScreen.jsx` - Add upload step
- `frontend_easyhealth/src/components/screens/profile.jsx` - Show verification status

## Estimated Effort

- Backend: 4-6 hours
- Frontend: 3-4 hours
- Admin Panel: 2-3 hours
- Testing: 2 hours

## Dependencies

- `pytesseract` - OCR library
- `Pillow` - Image processing
- `tesseract-ocr` - System dependency
