#!/usr/bin/env python3
"""
Test OCR on real prescription images
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend_easyhealth.epharm.myapp.advanced_ocr_handwriting import enhanced_analyze_prescription

# Test on prescription images
image_dir = 'backend_easyhealth/epharm/static/images/prescriptions'
images = [
    'myopd-sample-rx-full-eng.png',
    'WhatsApp_Image_2026-02-04_at_16.34.24.jpeg',
    'WhatsApp_Image_2026-02-04_at_17.38.27.jpeg'
]

print('🧪 Testing OCR on Real Prescription Images')
print('=' * 70)

for img_name in images:
    img_path = os.path.join(image_dir, img_name)
    if os.path.exists(img_path):
        print(f'\n📄 Testing: {img_name}')
        print('-' * 70)
        result = enhanced_analyze_prescription(img_path)
        
        print(f"Success: {result['success']}")
        print(f"Confidence: {result['confidence']}")
        ocr_conf = result.get('ocr_confidence', 'N/A')
        if isinstance(ocr_conf, float):
            print(f"OCR Confidence: {ocr_conf:.2f}")
        else:
            print(f"OCR Confidence: {ocr_conf}")
        print(f"NMC Number: {result['nmc_number']}")
        print(f"Doctor Name: {result['doctor_name']}")
        print(f"Hospital: {result['hospital_name']}")
        print(f"Department: {result['department']}")
        print(f"Medicines: {len(result['medicines'])}")
        for med in result['medicines'][:3]:  # Show first 3 medicines
            print(f"  - {med['name']} {med['dosage']} {med['frequency']}")
        print(f"Patient: {result['patient_info']}")
        print(f"Date: {result['date']}")
        print(f"Raw Text (first 200 chars):")
        print(result['raw_text'][:200] if result['raw_text'] else 'None')
    else:
        print(f'❌ Image not found: {img_path}')

print('\n' + '=' * 70)
print('✅ OCR Testing Complete')
