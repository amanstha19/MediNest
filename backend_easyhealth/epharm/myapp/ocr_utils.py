"""
Prescription OCR Utility using Tesseract
Extracts NMC number, doctor name, hospital name, and department from prescription images
"""

import subprocess
import re
import os
from pathlib import Path


def extract_text_from_image(image_path):
    """
    Extract text from an image using Tesseract OCR
    
    Args:
        image_path: Path to the prescription image
        
    Returns:
        str: Extracted text from the image
    """
    if not os.path.exists(image_path):
        return ""
    
    try:
        # Run tesseract to extract text
        result = subprocess.run(
            ['tesseract', image_path, 'stdout', '-l', 'eng', '--psm', '6'],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""


def extract_nmc_number(text):
    """
    Extract NMC (Nepal Medical Council) number from text
    
    NMC numbers in Nepal are typically in formats like:
    - NMC-12345
    - NMC No. 12345
    - NMC No 12345
    - Registration No: NMC-12345
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted NMC number or None
    """
    # Pattern for NMC number
    patterns = [
        r'NMC[-\s]*(?:No\.?|Registration\s*(?:No\.?|Number))?\s*:?\s*(\d{4,7})',
        r'NMC\s*(\d{4,7})',
        r'(?:No\.?|Number)\s*:?\s*NMC[-\s]*(\d{4,7})',
        r'Registration\s*(?:No\.?)?\s*:?\s*(\d{4,7})',
        r'NMC\s*No\.?\s*:?\s*(\d{4,7})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None


def extract_doctor_name(text):
    """
    Extract doctor name from text
    
    Doctor names are typically preceded by:
    - Dr.
    - Dr
    - Doctor
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted doctor name or None
    """
    # Pattern for doctor name (Dr. Name)
    patterns = [
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        r'(?:Dr\.?|Doctor)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        r'Name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        r'Recommended\s*(?:by)?\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        r'(?:Dr\.?|Doctor)\.?\s*([A-Z][a-z]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    
    return None


def extract_hospital_name(text):
    """
    Extract hospital/clinic name from text
    
    Common patterns:
    - Hospital: Name
    - Clinic: Name
    - Name Hospital
    - Name Clinic
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted hospital name or None
    """
    patterns = [
        r'(?:Hospital|Clinic|Medical\s*Center|Health\s*Center|Hospital\s*Name)[\s:]*([A-Z][A-Za-z\s&]+?(?:Hospital|Clinic|Medical|Center|Health)?)',
        r'([A-Z][A-Za-z\s&]+?(?:Hospital|Clinic|Medical\s*Center|Health\s*Center))',
        r'(?:At|From)[\s]+([A-Z][A-Za-z\s&]+)',
        r'([A-Z][A-Za-z\s&]+(?:Hospital|Clinic|Medical|Center|Health))',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            name = match.group(1).strip()
            # Clean up the name
            name = re.sub(r'\s+', ' ', name)
            if len(name) > 3:
                return name
    
    return None


def extract_department(text):
    """
    Extract department/specialty from text
    
    Common departments:
    - Cardiology
    - Orthopedics
    - General Medicine
    - Pediatrics
    - etc.
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted department or None
    """
    departments = [
        'Cardiology', 'Orthopedics', 'Orthopaedic', 'Neurology', 'Neurosurgery',
        'Pediatrics', 'Pediatric', 'General Medicine', 'General Practice',
        'Dermatology', 'Psychiatry', 'Psychology', 'Ophthalmology', 'Eye',
        'ENT', 'Otorhinolaryngology', 'Gynecology', 'Gynaecology', 'Obstetrics',
        'Urology', 'Nephrology', 'Gastroenterology', 'Endocrinology',
        'Oncology', 'Radiology', 'Pathology', 'Anesthesiology', 'Anaesthesia',
        'Surgery', 'Internal Medicine', 'Emergency Medicine', 'ICU',
        'Pulmonology', 'Rheumatology', 'Hematology', 'Allergy'
    ]
    
    text_lower = text.lower()
    
    for dept in departments:
        pattern = r'\b' + re.escape(dept.lower()) + r'\b'
        if re.search(pattern, text_lower):
            return dept
    
    # Try to extract department from patterns
    patterns = [
        r'Department\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'Dept\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'(?:Dept?|Department)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    
    return None


def extract_date(text):
    """
    Extract date from prescription
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted date or None
    """
    # Pattern for date (various formats)
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})',
        r'Date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None


def analyze_prescription(image_path):
    """
    Analyze a prescription image and extract key information
    
    Args:
        image_path: Path to the prescription image
        
    Returns:
        dict: Dictionary containing extracted information
    """
    text = extract_text_from_image(image_path)
    
    if not text:
        return {
            'success': False,
            'error': 'Could not extract text from image',
            'raw_text': '',
            'nmc_number': None,
            'doctor_name': None,
            'hospital_name': None,
            'department': None,
            'date': None,
            'confidence': 'low'
        }
    
    nmc_number = extract_nmc_number(text)
    doctor_name = extract_doctor_name(text)
    hospital_name = extract_hospital_name(text)
    department = extract_department(text)
    date = extract_date(text)
    
    # Calculate confidence based on what was found
    found_items = sum(1 for x in [nmc_number, doctor_name, hospital_name, department, date] if x)
    if found_items >= 3:
        confidence = 'high'
    elif found_items >= 2:
        confidence = 'medium'
    else:
        confidence = 'low'
    
    return {
        'success': True,
        'raw_text': text,
        'nmc_number': nmc_number,
        'doctor_name': doctor_name,
        'hospital_name': hospital_name,
        'department': department,
        'date': date,
        'confidence': confidence,
        'error': None
    }


def batch_analyze_prescriptions(image_paths):
    """
    Analyze multiple prescription images
    
    Args:
        image_paths: List of paths to prescription images
        
    Returns:
        list: List of analysis results
    """
    results = []
    for path in image_paths:
        result = analyze_prescription(path)
        result['image_path'] = str(path)
        results.append(result)
    return results


if __name__ == '__main__':
    # Test with a sample image
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        result = analyze_prescription(image_path)
        print(f"Success: {result['success']}")
        print(f"NMC Number: {result['nmc_number']}")
        print(f"Doctor Name: {result['doctor_name']}")
        print(f"Hospital Name: {result['hospital_name']}")
        print(f"Department: {result['department']}")
        print(f"Date: {result['date']}")
        print(f"Confidence: {result['confidence']}")
        print(f"\nRaw Text:\n{result['raw_text'][:500]}...")
    else:
        print("Usage: python ocr_utils.py <image_path>")
