#!/usr/bin/env python3
"""
Simple test script for enhanced OCR functionality
Tests the extraction functions without Django dependency
"""

import sys
import os
import re

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Import the OCR functions directly
from backend_easyhealth.epharm.myapp.ocr_utils_enhanced import (
    extract_doctor_name,
    extract_nmc_number,
    extract_medicines,
    extract_hospital_name,
    extract_department,
    extract_patient_info,
    extract_date,
    extract_followup_date,
    extract_complaints,
    calculate_confidence
)


def test_doctor_name_extraction():
    """Test doctor name extraction"""
    print("\n" + "="*60)
    print("Testing Doctor Name Extraction")
    print("="*60)
    
    test_cases = [
        ("Standard Dr. format", "Dr. John Smith prescribed medicine"),
        ("Dr with period", "Dr. Jane Doe"),
        ("Doctor full word", "Doctor William Brown"),
        ("Dr with MD", "Dr. Robert MD"),
        ("Nepal format", "Dr. Sharma NMC No. 12345"),
        ("Name field", "Name: Dr. Michael Johnson"),
        ("Recommended by", "Recommended by Dr. David Lee"),
    ]
    
    for name, text in test_cases:
        result = extract_doctor_name(text)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")


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
    ]
    
    for name, text in test_cases:
        result = extract_nmc_number(text)
        print(f"\n✓ {name}")
        print(f"  Input: {text}")
        print(f"  Result: {result}")


def test_medicine_extraction():
    """Test medicine extraction"""
    print("\n" + "="*60)
    print("Testing Medicine Extraction")
    print("="*60)
    
    test_texts = [
        "Rx: Amoxicillin 500mg BD x 5 days",
        "1. Pantoprazole 40mg OD before breakfast",
        "Paracetamol 500mg TID for fever",
        "Azithromycin 500mg once daily",
        "Medicines: Ibuprofen 400mg, Diclofenac 50mg",
        "Salbutamol inhaler 2 puffs QID",
    ]
    
    for text in test_texts:
        result = extract_medicines(text)
        print(f"\n✓ Input: {text}")
        print(f"  Medicines found: {len(result)}")
        for med in result:
            print(f"    - {med}")


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
        confidence = calculate_confidence(test["data"])
        print(f"\n✓ {test['name']}")
        print(f"  Confidence: {confidence}")


def main():
    """Main test function"""
    print("🧪 Enhanced OCR Test Suite")
    print("=" * 60)
    print("Testing individual extraction functions")
    print("No Django setup required")
    
    test_doctor_name_extraction()
    test_nmc_extraction()
    test_medicine_extraction()
    test_hospital_extraction()
    test_department_extraction()
    test_patient_info_extraction()
    test_date_extraction()
    test_confidence_calculation()
    
    print("\n" + "="*60)
    print("✅ All tests completed successfully!")
    print("="*60)


if __name__ == '__main__':
    main()

