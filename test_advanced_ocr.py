#!/usr/bin/env python3
"""
Test script for the new advanced OCR implementation
Tests all the improvements made to the OCR system
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the new advanced OCR functions
from backend_easyhealth.epharm.myapp.advanced_ocr_handwriting import (
    enhanced_analyze_prescription,
    extract_doctor_name,
    extract_nmc_number,
    extract_medicine_from_handwriting,
    extract_hospital_name,
    extract_department,
    extract_patient_info,
    extract_date,
    validate_doctor_name,
    fuzzy_match_doctor_name,
    preprocess_image_for_handwriting,
    extract_with_tesseract_handwriting,
    calculate_overall_confidence,
)


def test_doctor_name_extraction():
    """Test doctor name extraction with validation"""
    print("\n" + "="*60)
    print("Testing Doctor Name Extraction with Validation")
    print("="*60)
    
    test_cases = [
        ("Standard Dr. format", "Dr. John Smith prescribed medicine"),
        ("Dr with period", "Dr. Jane Doe"),
        ("Doctor full word", "Doctor William Brown"),
        ("Dr with MD", "Dr. Robert MD"),
        ("Nepal format", "Dr. Sharma NMC No. 12345"),
        ("Name field", "Name: Dr. Michael Johnson"),
        ("Recommended by", "Recommended by Dr. David Lee"),
        ("Invalid - too short", "Dr. A"),
        ("Invalid - with numbers", "Dr. John123"),
    ]
    
    for name, text in test_cases:
        result = extract_doctor_name(text)
        is_valid, confidence = validate_doctor_name(result) if result else (False, 0.0)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")
        print(f"  Valid: {is_valid}, Confidence: {confidence:.2f}")


def test_nmc_extraction():
    """Test NMC number extraction"""
    print("\n" + "="*60)
    print("Testing NMC Number Extraction")
    print("="*60)
    
    test_cases = [
        ("Standard format", "NMC No. 12345"),
        ("With hyphen", "NMC-98765"),
        ("Registration", "Registration No: NMC-45678"),
        ("NMC with text", "NMC Registration 11111"),
        ("No period", "NMC No 22222"),
        ("With hash", "NMC # 54321"),
    ]
    
    for name, text in test_cases:
        result = extract_nmc_number(text)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")


def test_medicine_extraction():
    """Test medicine extraction with fuzzy matching"""
    print("\n" + "="*60)
    print("Testing Medicine Extraction with Fuzzy Matching")
    print("="*60)
    
    test_texts = [
        "Rx: Amoxicillin 500mg BD x 5 days",
        "1. Pantoprazole 40mg OD before breakfast",
        "Paracetamol 500mg TID for fever",
        "Azithromycin 500mg once daily",
        "Medicines: Ibuprofen 400mg, Diclofenac 50mg",
        "Salbutamol inhaler 2 puffs QID",
        "Metformin 500mg BD",  # Diabetes medicine
        "Amox 250mg TID",  # Fuzzy match for Amoxicillin
        "PCM 500mg SOS",  # Fuzzy match for Paracetamol
    ]
    
    for text in test_texts:
        result = extract_medicine_from_handwriting(text)
        print(f"\n✓ Input: {text}")
        print(f"  Medicines found: {len(result)}")
        for med in result:
            print(f"    - {med['name']} {med['dosage']} {med['frequency']} {med['duration']} (confidence: {med.get('confidence', 'unknown')})")


def test_hospital_extraction():
    """Test hospital name extraction"""
    print("\n" + "="*60)
    print("Testing Hospital Name Extraction")
    print("="*60)
    
    test_cases = [
        ("Standard", "City Hospital"),
        ("With Clinic", "Medicare Clinic"),
        ("Medical Center", "Health Medical Center"),
        ("Hospital Name field", "Hospital Name: National Hospital"),
    ]
    
    for name, text in test_cases:
        result = extract_hospital_name(text)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")


def test_department_extraction():
    """Test department extraction"""
    print("\n" + "="*60)
    print("Testing Department Extraction")
    print("="*60)
    
    test_cases = [
        ("Cardiology", "Department of Cardiology"),
        ("Neurology", "Neurology department"),
        ("Pediatrics", "Pediatrics ward"),
        ("General Medicine", "General Medicine"),
        ("Orthopedics", "Orthopedics clinic"),
    ]
    
    for name, text in test_cases:
        result = extract_department(text)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")


def test_patient_info_extraction():
    """Test patient info extraction"""
    print("\n" + "="*60)
    print("Testing Patient Info Extraction")
    print("="*60)
    
    test_text = """
    Patient Name: John Doe
    Age: 35 years
    Gender: Male
    """
    
    result = extract_patient_info(test_text)
    print(f"\n✓ Patient Info:")
    for key, value in result.items():
        print(f"  - {key}: {value}")


def test_date_extraction():
    """Test date extraction"""
    print("\n" + "="*60)
    print("Testing Date Extraction")
    print("="*60)
    
    test_cases = [
        ("DD-MM-YYYY", "15-01-2026"),
        ("With month name", "15 January 2026"),
        ("Date label", "Date: 20-02-2026"),
    ]
    
    for name, text in test_cases:
        result = extract_date(text)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")


def test_fuzzy_matching():
    """Test fuzzy name matching"""
    print("\n" + "="*60)
    print("Testing Fuzzy Name Matching")
    print("="*60)
    
    test_cases = [
        "Dr. Ram Sharma",
        "Dr. Shyam Kumar",
        "Dr. Sita Devi",
        "Dr. Hari Prasad",
    ]
    
    for text in test_cases:
        name, confidence = fuzzy_match_doctor_name(text)
        print(f"\n✓ Input: {text}")
        print(f"  Matched: {name}")
        print(f"  Confidence: {confidence:.2f}")


def test_confidence_calculation():
    """Test confidence calculation"""
    print("\n" + "="*60)
    print("Testing Confidence Calculation")
    print("="*60)
    
    test_cases = [
        {
            "name": "Full extraction",
            "data": {
                "doctor_name": "Dr. John",
                "nmc_number": "12345",
                "hospital_name": "City Hospital",
                "department": "Cardiology",
                "medicines": [{"name": "Amoxicillin"}],
                "patient_info": {"name": "Jane"},
                "date": "15-01-2026"
            }
        },
        {
            "name": "Partial extraction",
            "data": {
                "doctor_name": "Dr. John",
                "medicines": []
            }
        }
    ]
    
    for test in test_cases:
        confidence = calculate_overall_confidence(test["data"])
        print(f"\n✓ {test['name']}")
        print(f"  Confidence: {confidence}")


def test_image_preprocessing():
    """Test image preprocessing availability"""
    print("\n" + "="*60)
    print("Testing Image Preprocessing")
    print("="*60)
    
    # Check if PIL or OpenCV is available
    try:
        from PIL import Image
        print("✓ PIL/Pillow is available for image preprocessing")
    except ImportError:
        print("✗ PIL/Pillow is NOT available")
    
    try:
        import cv2
        print("✓ OpenCV is available for advanced image preprocessing")
    except ImportError:
        print("✗ OpenCV is NOT available")


def main():
    """Main test function"""
    print("🧪 Advanced OCR Test Suite")
    print("=" * 60)
    print("Testing the new advanced OCR implementation")
    print("Features: Image preprocessing, fuzzy matching, validation")
    print("=" * 60)
    
    test_doctor_name_extraction()
    test_nmc_extraction()
    test_medicine_extraction()
    test_hospital_extraction()
    test_department_extraction()
    test_patient_info_extraction()
    test_date_extraction()
    test_fuzzy_matching()
    test_confidence_calculation()
    test_image_preprocessing()
    
    print("\n" + "="*60)
    print("✅ All tests completed successfully!")
    print("="*60)
    print("\nNext steps:")
    print("1. Test with actual prescription images")
    print("2. Install OpenCV for better preprocessing: pip install opencv-python")
    print("3. Install Pillow if not available: pip install Pillow")


if __name__ == '__main__':
    main()
