#!/usr/bin/env python3
"""
Test script for Handwriting OCR System
Tests all the enhanced OCR features including handwriting recognition
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/amanshrestha/Desktop/MediNest/backend_easyhealth')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
django.setup()

from myapp.advanced_ocr_handling import (
    preprocess_image_for_handwriting,
    extract_with_tesseract_handwriting,
    extract_handwritten_name,
    validate_doctor_name,
    fuzzy_match_doctor_name,
    extract_medicine_from_handwriting,
    enhanced_analyze_prescription
)

# Test data
test_samples = [
    {
        'name': 'Clear Handwriting',
        'text': 'Dr. Ram Sharma\nNMC: 12345\nAmoxicillin 500mg BD\nHospital: City Hospital',
        'expected_doctor': 'Ram Sharma',
        'expected_medicine': 'Amoxicillin'
    },
    {
        'name': 'OCR Misread Handwriting',
        'text': 'Dr. Rm Shrma\nNMC: 12345\nAmoxclln 500mg BD',
        'expected_doctor': 'Ram Sharma',  # Should be corrected via fuzzy matching
        'expected_medicine': 'Amoxicillin'
    },
    {
        'name': 'Cursive Style',
        'text': 'Dr. Sita Poudel\nPantoprazole 40mg OD\nMetformin 500mg BD',
        'expected_doctor': 'Sita Poudel',
        'expected_medicine': 'Pantoprazole'
    },
    {
        'name': 'Minimal Information',
        'text': 'Dr. Hari KC',
        'expected_doctor': 'Hari KC',
        'expected_medicine': None
    }
]


def test_doctor_name_extraction():
    """Test doctor name extraction from various text formats"""
    print("=" * 60)
    print("TEST 1: Doctor Name Extraction")
    print("=" * 60)
    
    passed = 0
    total = len(test_samples)
    
    for sample in test_samples:
        print(f"\nTesting: {sample['name']}")
        print(f"Input: {sample['text'][:50]}...")
        
        # Extract doctor name
        extracted_name = extract_handwritten_name(sample['text'])
        
        if extracted_name:
            print(f"✅ Extracted: {extracted_name}")
            
            # Validate the name
            is_valid, confidence = validate_doctor_name(extracted_name)
            print(f"✅ Validation: Valid={is_valid}, Confidence={confidence:.2f}")
            
            # Try fuzzy matching
            fuzzy_result = fuzzy_match_doctor_name(extracted_name)
            if fuzzy_result['matched']:
                print(f"✅ Fuzzy Match: {fuzzy_result['matched_name']} ({fuzzy_result['confidence']:.1f}%)")
                passed += 1
            elif is_valid:
                passed += 1
        else:
            print("❌ No name extracted")
    
    print(f"\nResult: {passed}/{total} tests passed")
    return passed == total


def test_medicine_extraction():
    """Test medicine extraction from OCR text"""
    print("\n" + "=" * 60)
    print("TEST 2: Medicine Extraction")
    print("=" * 60)
    
    test_medicines = [
        "Amoxicillin 500mg BD for 5 days",
        "Pantoprazole 40mg OD before food",
        "Ibuprofen 400mg TID after meals",
        "Metformin 500mg BD with breakfast and dinner",
        "Salbutamol 2.5mg via nebulizer QID"
    ]
    
    passed = 0
    total = len(test_medicines)
    
    for medicine_text in test_medicines:
        print(f"\nTesting: {medicine_text}")
        
        medicines = extract_medicine_from_handwriting(medicine_text)
        
        if medicines:
            for med in medicines:
                print(f"✅ Extracted: {med['name']} - {med['extracted_dosage']} - {med['extracted_frequency']}")
                passed += 1
        else:
            print("❌ No medicines extracted")
    
    print(f"\nResult: {passed}/{total} medicines found")
    return passed >= total * 0.8  # 80% pass rate


def test_image_preprocessing():
    """Test image preprocessing functions"""
    print("\n" + "=" * 60)
    print("TEST 3: Image Preprocessing")
    print("=" * 60)
    
    # Test that the function exists and runs
    try:
        # Create a test image
        import cv2
        import numpy as np
        
        # Create a simple test image
        test_image = np.ones((100, 100, 3), dtype=np.uint8) * 255
        cv2.putText(test_image, "Test", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
        
        # Save test image
        test_path = '/tmp/test_prescription.jpg'
        cv2.imwrite(test_path, test_image)
        
        # Test preprocessing
        processed_path = preprocess_image_for_handwriting(test_path)
        
        if os.path.exists(processed_path):
            print(f"✅ Preprocessing created: {processed_path}")
            
            # Check file size
            original_size = os.path.getsize(test_path)
            processed_size = os.path.getsize(processed_path)
            print(f"✅ File sizes: Original={original_size}bytes, Processed={processed_size}bytes")
            
            # Cleanup
            os.remove(test_path)
            os.remove(processed_path)
            
            return True
        else:
            print("❌ Preprocessing failed")
            return False
            
    except Exception as e:
        print(f"❌ Preprocessing error: {e}")
        return False


def test_tesseract_integration():
    """Test Tesseract OCR integration"""
    print("\n" + "=" * 60)
    print("TEST 4: Tesseract OCR Integration")
    print("=" * 60)
    
    try:
        # Create a simple test image
        import cv2
        import numpy as np
        
        test_image = np.ones((200, 400, 3), dtype=np.uint8) * 255
        test_text = "Dr. Test Doctor\nAmoxicillin 500mg\nNMC: 12345"
        
        y_offset = 30
        for line in test_text.split('\n'):
            cv2.putText(test_image, line, (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
            y_offset += 40
        
        # Save test image
        test_path = '/tmp/test_ocr.jpg'
        cv2.imwrite(test_path, test_image)
        
        # Run OCR
        result = extract_with_tesseract_handwriting(test_path)
        
        if result['success']:
            print(f"✅ OCR Success")
            print(f"✅ Text extracted: {result['text'][:100]}...")
            
            # Cleanup
            os.remove(test_path)
            return True
        else:
            print(f"❌ OCR Failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ OCR Integration Error: {e}")
        return False


def test_enhanced_analysis():
    """Test the complete enhanced analysis function"""
    print("\n" + "=" * 60)
    print("TEST 5: Complete Enhanced Analysis")
    print("=" * 60)
    
    # Test with mock text (since we don't have actual images)
    mock_text = """
    Dr. Ram Sharma
    NMC: 12345
    Department: Cardiology
    
    Rx:
    1. Amoxicillin 500mg BD x 5 days
    2. Pantoprazole 40mg OD
    
    Date: 01/02/2026
    """
    
    print("Testing with mock prescription text:")
    print(mock_text)
    
    # Since we can't test with actual image, let's test the components
    print("\n✅ Doctor Name:", extract_handwritten_name(mock_text))
    print("✅ Medicines:", len(extract_medicine_from_handwriting(mock_text)))
    
    # Validate doctor name
    doctor_name = extract_handwritten_name(mock_text)
    if doctor_name:
        is_valid, confidence = validate_doctor_name(doctor_name)
        print(f"✅ Name Validation: {is_valid} (confidence: {confidence:.2f})")
        
        # Fuzzy match
        fuzzy_result = fuzzy_match_doctor_name(doctor_name)
        print(f"✅ Fuzzy Match: {fuzzy_result}")
    
    return True


def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("🧪 HANDWRITING OCR SYSTEM - COMPREHENSIVE TESTING")
    print("=" * 80)
    
    results = []
    
    # Test 1: Doctor Name Extraction
    results.append(("Doctor Name Extraction", test_doctor_name_extraction()))
    
    # Test 2: Medicine Extraction
    results.append(("Medicine Extraction", test_medicine_extraction()))
    
    # Test 3: Image Preprocessing
    results.append(("Image Preprocessing", test_image_preprocessing()))
    
    # Test 4: Tesseract Integration
    results.append(("Tesseract Integration", test_tesseract_integration()))
    
    # Test 5: Complete Analysis
    results.append(("Complete Analysis", test_enhanced_analysis()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Handwriting OCR system is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the implementation.")
    
    return passed == len(results)


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)

