# Prescription Verification System Implementation

## Backend Changes

### 1. Add PrescriptionVerification Model

```python
class PrescriptionVerification(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='verification')
    extracted_nmc_number = models.CharField(max_length=50, blank=True, null=True)
    doctor_name = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    verified_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    verification_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2. Add OCR View

- Endpoint: `POST /api/prescription/extract-nmc/`
- Uses Tesseract OCR to extract text
- Regex pattern to find NMC number
- Returns extracted data

### 3. Admin Changes

- Add prescription verification queue
- Pharmacist can approve/reject with notes
- Show NMC number if extracted

## Frontend Changes

### 1. PrescriptionUpload Component

- Drag & drop upload
- Show extracted NMC preview
- Progress indicator

### 2. PrescriptionStatus Component

- Show verification status in orders
- Pending → Approved/Rejected badge
- Pharmacist notes display

## Workflow

1. Customer uploads prescription during checkout
2. System extracts NMC number (or manual entry)
3. Order created with prescription file
4. Pharmacist reviews in admin panel
5. Approve/Reject with notes
6. Customer sees status in profile
