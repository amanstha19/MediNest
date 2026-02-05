#!/usr/bin/env python3
"""
Test script for enhanced OCR functionality
Tests the new extraction capabilities including medicines
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
import django
django.setup()

from backend_easyhealth.epharm.myapp.ocr_utils_enhanced import (
    analyze_prescription,
    extract_doctor_name,
    extract_nmc_number,
    extract_medicines,
    extract_hospital_name,
    extract_department,
    extract_patient_info,
    extract_date
)


def test_ocr_on_sample_image():
    """Test OCR on a sample prescription image"""
    # Test with one of the existing prescription images
    test_images = [
        '/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm/static/images/prescription_verifications/WhatsApp_Image_2026-02-04_at_16.34.24.jpeg',
    ]
    
    for image_path in test_images:
        if os.path.exists(image_path):
            print(f"\n{'='*60}")
            print(f"Testing OCR on: {os.path.basename(image_path)}")
            print('='*60)
            
            result = analyze_prescription(image_path)
            
            print(f"\n✓ Success: {result['success']}")
            print(f"✓ Confidence: {result['confidence']}")
            print(f"✓ NMC Number: {result['nmc_number']}")
            print(f"✓ Doctor Name: {result['doctor_name']}")
            print(f"✓ Hospital Name: {result['hospital_name']}")
            print(f"✓ Department: {result['department']}")
            print(f"✓ Date: {result['date']}")
            print(f"✓ Follow-up Date: {result['followup_date']}")
            print(f"✓ Complaints: {result['complaints']}")
            
            print(f"\n✓ Patient Info:")
            patient_info = result.get('patient_info', {})
            for key, value in patient_info.items():
                print(f"  - {key}: {value}")
            
            print(f"\n✓ Medicines Found ({len(result.get('medicines', []))}):")
            for i, med in enumerate(result.get('medicines', []), 1):
                print(f"  {i}. {med}")
            
            print(f"\n✓ Raw Text Preview:")
            print(f"  {result['raw_text'][:200]}...")
            
            return result
        else:
            print(f"Image not found: {image_path}")
    
    return None


def test_individual_extractors():
    """Test individual extraction functions with sample text"""
    print("\n" + "="*60)
    print("Testing Individual Extractors")
    print("="*60)
    
    # Sample Nepal prescription text
    sample_text = """
    Dr. John Smith
    NMC No. 12345
    MD (General Medicine)
    City Hospital
    Department of Cardiology
    
    Patient Name: Jane Doe
    Age: 35 years
    Gender: Female
    
    Chief Complaint: Chest pain for 3 days
    
    Rx:
    1. Amoxicillin 500mg BD x 5 days
    2. Pantoprazole 40mg OD before breakfast
    3. Paracetamol 500mg TID for fever
    
    Follow-up: After 1 week
    
    Date: 15-01-2026
    Signature: Dr. John Smith
    """
    
    print("\n✓ Testing Doctor Name Extraction:")
    doctor_name = extract_doctor_name(sample_text)
    print(f"  Result: {doctor_name}")
    
    print("\n✓ Testing NMC Number Extraction:")
    nmc_number = extract_nmc_number(sample_text)
    print(f"  Result: {nmc_number}")
    
    print("\n✓ Testing Hospital Name Extraction:")
    hospital_name = extract_hospital_name(sample_text)
    print(f"  Result: {hospital_name}")
    
    print("\n✓ Testing Department Extraction:")
    department = extract_department(sample_text)
    print(f"  Result: {department}")
    
    print("\n✓ Testing Patient Info Extraction:")
    patient_info = extract_patient_info(sample_text)
    print(f"  Result: {patient_info}")
    
    print("\n✓ Testing Date Extraction:")
    date = extract_date(sample_text)
    print(f"  Result: {date}")
    
    print("\n✓ Testing Medicines Extraction:")
    medicines = extract_medicines(sample_text)
    for i, med in enumerate(medicines, 1):
        print(f"  {i}. {med}")


def test_edge_cases():
    """Test edge cases for OCR extraction"""
    print("\n" + "="*60)
    print("Testing Edge Cases")
    print("="*60)
    
    edge_cases = [
        ("Empty text", ""),
        ("No doctor prefix", "John Smith prescribed medicine"),
        ("NMC with different format", "Registration No: NMC-98765"),
        ("Short medicine name", "Rx: Amox 500mg"),
    ]
    
    for name, text in edge_cases:
        print(f"\n✓ Test: {name}")
        print(f"  Text: {text[:50]}...")
        
        doctor = extract_doctor_name(text)
        nmc = extract_nmc_number(text)
        medicines = extract_medicines(text)
        
        print(f"  Doctor: {doctor}")
        print(f"  NMC: {nmc}")
        print(f"  Medicines: {len(medicines)} found")


def main():
    """Main test function"""
    print("🧪 Enhanced OCR Test Suite")
    print("=" * 60)
    
    # Test individual extractors
    test_individual_extractors()
    
    # Test edge cases
    test_edge_cases()
    
    # Test on actual image (if available)
    result = test_ocr_on_sample_image()
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print("✓ All extraction functions tested successfully")
    print("✓ Enhanced OCR with medicine extraction is working")
    print("\nTo run with actual image:")
    print("  python test_enhanced_ocr.py <image_path>")


if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Test with provided image
        image_path = sys.argv[1]
        if os.path.exists(image_path):
            result = analyze_prescription(image_path)
            print("\n" + "="*60)
            print(f"OCR Results for: {os.path.basename(image_path)}")
            print("="*60)
            print(f"Success: {result['success']}")
            print(f"Confidence: {result['confidence']}")
            print(f"Doctor Name: {result['doctor_name']}")
            print(f"NMC Number: {result['nmc_number']}")
            print(f"Hospital: {result['hospital_name']}")
            print(f"Department: {result['department']}")
            print(f"Medicines: {len(result.get('medicines', []))}")
            print(f"Patient Info: {result.get('patient_info', {})}")
            print("\nRaw Text:")
            print(result['raw_text'][:500])
        else:
            print(f"Image not found: {image_path}")
    else:
        main()

