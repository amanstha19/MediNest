"""
Enhanced Prescription OCR Utility using Tesseract
Extracts NMC number, doctor name, hospital name, department, and prescribed medicines from prescription images
"""

import subprocess
import re
import os
import json
from pathlib import Path


def extract_text_from_image(image_path, psm_mode='6'):
    """
    Extract text from an image using Tesseract OCR with enhanced settings
    
    Args:
        image_path: Path to the prescription image
        psm_mode: Page segmentation mode (6 = uniform block of text)
        
    Returns:
        str: Extracted text from the image
    """
    if not os.path.exists(image_path):
        return ""
    
    try:
        # Run tesseract with enhanced settings for better handwriting recognition
        result = subprocess.run(
            [
                'tesseract', image_path, 'stdout', 
                '-l', 'eng',  # English language
                '--psm', str(psm_mode),  # Page segmentation mode
                '--oem', '3',  # OCR Engine Mode (default + LSTM)
                '-c', 'preserve_interword_spaces=1'
            ],
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""


def extract_nmc_number(text):
    """
    Extract NMC (Nepal Medical Council) number from text with enhanced patterns
    
    NMC numbers in Nepal are typically in formats like:
    - NMC-12345
    - NMC No. 12345
    - NMC No 12345
    - Registration No: NMC-12345
    - NMC/REG/12345
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted NMC number or None
    """
    # Enhanced patterns for NMC number
    patterns = [
        r'NMC[-\s]*(?:No\.?|Registration\s*(?:No\.?|Number))?\s*:?\s*(\d{4,7})',
        r'NMC\s*(?:/)?\s*(?:REG|Registration)?[-\s]*(\d{4,7})',
        r'(?:No\.?|Number)\s*:?\s*NMC[-\s]*(\d{4,7})',
        r'Registration\s*(?:No\.?)?\s*:?\s*(\d{4,7})',
        r'NMC\s*No\.?\s*:?\s*(\d{4,7})',
        r'NMC\s+(\d{4,7})',
        r'NMC[-/](\d{4,7})',
        r'Reg\.?\s*(?:No\.?)?\s*:?\s*(\d{4,7})',
        r'(?:NMC|Registration)\s*[:#]?\s*(\d{4,7})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            nmc = match.group(1)
            # Validate NMC number format
            if nmc and len(nmc) >= 4 and len(nmc) <= 7:
                return nmc
    
    return None


def extract_doctor_name(text):
    """
    Extract doctor name from text with comprehensive patterns
    
    Doctor names are typically preceded by:
    - Dr.
    - Dr
    - Doctor
    - Dr. Name (MD)
    - Dr. Name (NMC)
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted doctor name or None
    """
    # Enhanced patterns for doctor name
    patterns = [
        # Standard patterns
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        r'(?:Dr\.?|Doctor)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        
        # Nepal-specific patterns
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:\(|NMC|MD|MBBS|REG)',
        r'(?:Dr\.?|Doctor)\.?\s*([A-Z][a-z]+)',
        
        # Patterns with titles
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+)\s+(?:MD|MBBS|MS|DM|MCh|PhD)',
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s*(?:NMC|Registration|Reg)',
        
        # Name field patterns
        r'Name\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        r'Recommended\s*(?:by)?\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        r'Prescribed\s*(?:by)?\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        
        # Signature patterns
        r'Signature\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+)\s*$',
        
        # Common Nepal doctor name patterns
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[,\n]',
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+)\s+\d{4,7}',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up the name
            name = re.sub(r'[^\w\s]', '', name).strip()
            name = re.sub(r'\s+', ' ', name)
            if len(name) >= 3 and len(name.split()) >= 1:
                return name
    
    # Fallback: Look for lines starting with Dr.
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if re.match(r'^(?:Dr\.?|Doctor)\s+', line, re.IGNORECASE):
            # Extract name part
            match = re.match(r'^(?:Dr\.?|Doctor)\s+(.+)$', line, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Clean and return
                name = re.sub(r'[^\w\s]', '', name).strip()
                name = re.sub(r'\s+', ' ', name)
                if len(name) >= 3:
                    return name
    
    return None


def extract_hospital_name(text):
    """
    Extract hospital/clinic name from text with enhanced patterns
    
    Common patterns:
    - Hospital: Name
    - Clinic: Name
    - Name Hospital
    - Name Clinic
    - Medical Center
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted hospital name or None
    """
    patterns = [
        # Standard patterns
        r'(?:Hospital|Clinic|Medical\s*Center|Health\s*Center|Hospital\s*Name|Center)[\s:]*([A-Z][A-Za-z\s&]+?(?:Hospital|Clinic|Medical|Center|Health)?)',
        r'([A-Z][A-Za-z\s&]+?(?:Hospital|Clinic|Medical\s*Center|Health\s*Center))',
        
        # Location-based patterns
        r'(?:At|From)[\s]+([A-Z][A-Za-z\s&]+)',
        r'(?:At|From|in)\s+([A-Z][A-Za-z\s&]+(?:Hospital|Clinic|Medical|Center|Health))',
        
        # Common hospital name patterns
        r'([A-Z][A-Za-z\s&]+(?:Hospital|Clinic|Medical|Center|Health|Institute))',
        
        # With "Name" label
        r'(?:Hospital|Clinic)\s*Name\s*:?\s*([A-Z][A-Za-z\s&]+)',
        
        # Department with hospital
        r'(?:Dept?|Department)\s+of\s+([A-Z][A-Za-z\s&]+(?:Hospital|Clinic))?',
        
        # Address-based extraction
        r'(?:Address|Location)[\s:]+([A-Z][A-Za-z\s&]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up the name
            name = re.sub(r'\s+', ' ', name)
            name = re.sub(r'[^\w\s&]', '', name)
            if len(name) > 3 and len(name) < 100:
                return name
    
    # Fallback: Look for common hospital keywords
    hospital_keywords = ['hospital', 'clinic', 'medical center', 'health center', 'institute']
    lines = text.split('\n')
    
    for line in lines:
        for keyword in hospital_keywords:
            if keyword in line.lower():
                # Extract the name
                match = re.search(r'([A-Z][A-Za-z\s&]+' + re.escape(keyword) + r')', line, re.IGNORECASE)
                if match:
                    name = match.group(1).strip()
                    name = re.sub(r'\s+', ' ', name)
                    return name
    
    return None


def extract_department(text):
    """
    Extract department/specialty from text with comprehensive patterns
    
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
        'Pulmonology', 'Rheumatology', 'Hematology', 'Allergy',
        'General', 'Medicine', 'Cardiac', 'Dental', 'Ortho', 'Neuro',
        'Gastro', 'Chest', 'Skin', 'Mental', 'Child', 'Women', 'Mother'
    ]
    
    text_lower = text.lower()
    
    # First, try exact department matching
    for dept in departments:
        pattern = r'\b' + re.escape(dept.lower()) + r'\b'
        if re.search(pattern, text_lower):
            return dept
    
    # Try to extract department from patterns
    patterns = [
        r'Department\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'Dept\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'(?:Dept?|Department)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'(?:Specialty|Specialisation)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            dept = match.group(1).strip()
            # Validate it's a known department
            if dept in departments or len(dept) > 2:
                return dept
    
    return None


def extract_medicines(text):
    """
    Extract prescribed medicines from prescription text with comprehensive patterns
    
    This function extracts:
    - Medicine names
    - Dosage information
    - Frequency instructions
    - Duration
    
    Args:
        text: OCR extracted text
        
    Returns:
        list: List of dictionaries containing medicine details
    """
    medicines = []
    
    # Common medicine name patterns (generic and brand names)
    common_medicines = [
        # Antibiotics
        'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Ceftriaxone', 'Cefixime',
        'Doxycycline', 'Erythromycin', 'Levofloxacin', 'Metronidazole', 'Norfloxacin',
        'Ofloxacin', 'Roxithromycin', 'Clarithromycin',
        
        # Pain relievers
        'Paracetamol', 'Ibuprofen', 'Diclofenac', 'Naproxen', 'Aspirin',
        'Acetaminophen', 'Tramadol', 'Morphine', 'Codeine', 'Meloxicam',
        
        # Antacids/PPI
        'Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Rabeprazole', 'Lansoprazole',
        'Ranitidine', 'Famotidine', 'Sucralfate',
        
        # Vitamins and supplements
        'Vitamin', 'Multivitamin', 'Calcium', 'Iron', 'Folic Acid', 'Vitamin B12',
        'Vitamin D', 'Zinc', 'Magnesium', 'Vitamin C',
        
        # Cardiovascular
        'Amlodipine', 'Atenolol', 'Metoprolol', 'Enalapril', 'Losartan',
        'Aspirin', 'Clopidogrel', 'Rosuvastatin', 'Atorvastatin', 'Simvastatin',
        
        # Respiratory
        'Salbutamol', 'Budesonide', 'Montelukast', 'Theophylline', 'Cetirizine',
        'Loratadine', 'Fexofenadine', 'Diphenhydramine',
        
        # Diabetes
        'Metformin', 'Glibenclamide', 'Glimepiride', 'Gliclazide', 'Sitagliptin',
        'Insulin', 'Glipizide',
        
        # CNS
        'Diazepam', 'Alprazolam', 'Clonazepam', 'Sertraline', 'Fluoxetine',
        'Escitalopram', 'Amitriptyline', 'Haloperidol',
        
        # Gastrointestinal
        'Domperidone', 'Ondansetron', 'Metoclopramide', 'Loperamide', 'Propranolol',
        'ORS', 'Zinc', 'Smecta',
        
        # Eye/Ear
        'Ciprofloxacin Eye', 'Ofloxacin Eye', 'Tobramycin', 'Gentamicin',
        
        # Topical
        'Mupirocin', 'Clotrimazole', 'Terbinafine', 'Hydrocortisone',
    ]
    
    # Dosage patterns
    dosage_patterns = [
        r'(\d+\s*(?:mg|ml|g|mcg|IU|%)?)',  # e.g., 500mg, 10ml
        r'(\d+\s*(?:tablet|capsule|drop|spray|ml|cc)?)',  # e.g., 1 tablet
    ]
    
# Frequency patterns
    frequency_patterns = [
        r'(OD|BD|TID|QID|PRN|QH|qH|Q4H|Q6H|Q8H|Q12H)',  # Standard abbreviations with capturing group
        r'(once|twice|three|four)\s*(daily|day|a day)?',  # English patterns with capturing groups
        r'(\d+)\s*(times?|x)\s*(a day|per day|daily)?',  # Numeric patterns with capturing groups
        r'(every|each)\s*(\d+)\s*(hours?|hrs?)',  # Every X hours with capturing groups
    ]
    
    # Duration patterns
    duration_patterns = [
        r'(\d+\s*(?:days?|dys?|d|D))',  # 5 days
        r'(\d+\s*(?:weeks?|wks?|w|W))',  # 2 weeks
        r'(\d+\s*(?:months?|mos?|m|M))',  # 1 month
        r'(\d+\s*(?:hours?|hrs?))',  # 6 hours
    ]
    
    # Split text into lines for processing
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check for medicine indicators
        medicine_found = False
        medicine_name = ""
        
        # Check for common medicines in the line
        for med in common_medicines:
            if med.lower() in line.lower():
                medicine_name = med
                medicine_found = True
                break
        
        # If no common medicine found, check for Rx symbol or other patterns
        if not medicine_found:
            # Check for Rx pattern
            if 'Rx' in line or 'Rx:' in line or 'R/x' in line:
                # Extract the medicine after Rx
                match = re.search(r'(?:Rx|R/x)[:\s]*([A-Za-z\s]+?)(?:\d|$|,|;|\))', line)
                if match:
                    medicine_name = match.group(1).strip()
                    medicine_found = True
            
            # Check for numbered list pattern (1., 2., etc.)
            elif re.match(r'^\d+[\.\)]\s*[A-Za-z]', line):
                match = re.match(r'^\d+[\.\)]\s*([A-Za-z\s]+)', line)
                if match:
                    medicine_name = match.group(1).strip()
                    medicine_found = True
        
        if medicine_found and len(medicine_name) >= 2:
            # Extract dosage
            dosage = ""
            for pattern in dosage_patterns:
                match = re.search(pattern, line)
                if match:
                    dosage = match.group(1).strip()
                    break
            
            # Extract frequency
            frequency = ""
            for pattern in frequency_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    frequency = match.group(1).strip()
                    break
            
            # Extract duration
            duration = ""
            for pattern in duration_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    duration = match.group(1).strip()
                    break
            
            # Create medicine entry
            medicine_entry = {
                'name': medicine_name,
                'dosage': dosage,
                'frequency': frequency,
                'duration': duration,
            }
            
            # Only add if we have meaningful data
            if medicine_entry['name'] or medicine_entry['dosage']:
                medicines.append(medicine_entry)
    
    # Also try to extract medicines using regex patterns
    # Look for patterns like "Medicine Name 500mg BD"
    medicine_pattern = r'([A-Z][a-z]+(?:\s+[A-Za-z]+)?)\s*(\d+\s*(?:mg|ml|g| mcg|IU)?)?\s*(OD|BD|TID|QID|PRN|QH|Q[0-9]+H)?\s*(\d+\s*(?:days?|weeks?|months?))?'
    
    # Alternative extraction using multiple patterns
    patterns_to_try = [
        # Pattern: Medicine Name + Dosage
        r'([A-Z][a-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|g| mcg|IU|%)?)',
        # Pattern: Dosage + Medicine Name
        r'(\d+\s*(?:mg|ml|g| mcg|IU|%))\s+([A-Z][a-z]+(?:\s+[A-Za-z]+)?)',
    ]
    
    for pattern in patterns_to_try:
        matches = re.finditer(pattern, text)
        for match in matches:
            name = match.group(1).strip() if match.group(1) else ""
            dosage = match.group(2).strip() if match.group(2) else ""
            
            # Check if this looks like a medicine (not random words)
            if name and len(name) >= 3:
                # Check if it's not already in our list
                existing = False
                for med in medicines:
                    if name.lower() in med['name'].lower():
                        existing = True
                        break
                
                if not existing:
                    medicines.append({
                        'name': name,
                        'dosage': dosage,
                        'frequency': '',
                        'duration': '',
                    })
    
    return medicines


def extract_patient_info(text):
    """
    Extract patient information from prescription text
    
    Args:
        text: OCR extracted text
        
    Returns:
        dict: Patient information including name, age, gender
    """
    patient_info = {}
    
    # Patient name patterns
    name_patterns = [
        r'Patient\s*Name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'Name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'Pt\.?\s*Name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        r'Patient\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            patient_info['name'] = match.group(1).strip()
            break
    
    # Age patterns
    age_patterns = [
        r'Age\s*:?\s*(\d+)\s*(?:years?|yrs?|y|Y)?',
        r'(\d+)\s*(?:years?|yrs?|y|Y)\s*old',
        r'Age\s*:?\s*(\d+)',
        r'(\d+)\s*y\.?\s*(?:M|F)',
        r'(?:Male|Female)\s*,?\s*(\d+)',
    ]
    
    for pattern in age_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            patient_info['age'] = match.group(1).strip() + " years"
            break
    
    # Gender patterns
    gender_patterns = [
        r'(Male|Female|M|F)',
        r'(Gentleman|Lady|Woman|Man)',
    ]
    
    for pattern in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender = match.group(1).strip()
            patient_info['gender'] = gender.capitalize()
            break
    
    return patient_info


def extract_date(text):
    """
    Extract date from prescription with enhanced patterns
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted date or None
    """
    # Pattern for date (various formats)
    patterns = [
        # Standard formats
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})',
        
        # With label
        r'Date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'Date\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})',
        r'(?:Date|Dated)[\s:]+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})',
        
        # Day patterns
        r'(\d{1,2}(?:st|nd|rd|th)?\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s*\d{2,4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date = match.group(1)
            # Clean up the date
            date = re.sub(r'\s+', ' ', date).strip()
            return date
    
    return None


def extract_followup_date(text):
    """
    Extract follow-up date from prescription
    
    Args:
        text: OCR extracted text
        
    Returns:
        str or None: Extracted follow-up date or None
    """
    patterns = [
        r'Follow[\s-]*up\s*(?:Date)?\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'Follow[\s-]*up\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'Review\s*(?:Date)?\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'Next\s*(?:visit|review)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(?:After|See\s+us|Visit)\s+(\d+\s*(?:days?|weeks?|months?))',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None


def extract_complaints(text):
    """
    Extract chief complaints from prescription
    
    Args:
        text: OCR extracted text
        
    Returns:
        str: Extracted complaints or None
    """
    patterns = [
        r'Chief\s*Complaint[s]?\s*:?\s*([A-Z][^.!?\n]+)',
        r'Complaint[s]?\s*:?\s*([A-Z][^.!?\n]+)',
        r'C/O\s*:?\s*([A-Z][^.!?\n]+)',
        r'History\s*of\s*Present\s*Illness\s*:?\s*([A-Z][^.!?\n]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            complaint = match.group(1).strip()
            complaint = re.sub(r'\s+', ' ', complaint)
            if len(complaint) > 3:
                return complaint
    
    return None


def calculate_confidence(extracted_data):
    """
    Calculate confidence score based on extracted data
    
    Args:
        extracted_data: Dictionary containing extracted information
        
    Returns:
        str: Confidence level (high, medium, low)
    """
    score = 0
    max_score = 0
    
    fields = [
        'doctor_name', 'nmc_number', 'hospital_name', 'department',
        'medicines', 'patient_info', 'date'
    ]
    
    for field in fields:
        max_score += 2
        if extracted_data.get(field):
            if field == 'medicines' and len(extracted_data.get('medicines', [])) > 0:
                score += 2
            elif extracted_data.get(field):
                score += 2
    
    percentage = (score / max_score) * 100
    
    if percentage >= 70:
        return 'high'
    elif percentage >= 40:
        return 'medium'
    else:
        return 'low'


def analyze_prescription(image_path, use_enhanced=True):
    """
    Analyze a prescription image and extract key information with enhanced capabilities
    
    Args:
        image_path: Path to the prescription image
        use_enhanced: Whether to use enhanced extraction patterns
        
    Returns:
        dict: Dictionary containing extracted information
    """
    if use_enhanced:
        # Try multiple PSM modes for better results
        text = extract_text_from_image(image_path, psm_mode='6')
        
        if not text:
            # Try with different PSM mode
            text = extract_text_from_image(image_path, psm_mode='3')
    else:
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
            'medicines': [],
            'patient_info': {},
            'date': None,
            'followup_date': None,
            'complaints': None,
            'confidence': 'low'
        }
    
    # Extract all information
    nmc_number = extract_nmc_number(text)
    doctor_name = extract_doctor_name(text)
    hospital_name = extract_hospital_name(text)
    department = extract_department(text)
    medicines = extract_medicines(text)
    patient_info = extract_patient_info(text)
    date = extract_date(text)
    followup_date = extract_followup_date(text)
    complaints = extract_complaints(text)
    
    # Calculate confidence
    extracted_data = {
        'nmc_number': nmc_number,
        'doctor_name': doctor_name,
        'hospital_name': hospital_name,
        'department': department,
        'medicines': medicines,
        'patient_info': patient_info,
        'date': date,
    }
    
    confidence = calculate_confidence(extracted_data)
    
    return {
        'success': True,
        'raw_text': text,
        'nmc_number': nmc_number,
        'doctor_name': doctor_name,
        'hospital_name': hospital_name,
        'department': department,
        'medicines': medicines,
        'patient_info': patient_info,
        'date': date,
        'followup_date': followup_date,
        'complaints': complaints,
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


# Alias for backward compatibility
def extract_doctor_name_simple(text):
    """Simple doctor name extraction for backward compatibility"""
    return extract_doctor_name(text)


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
        print(f"Medicines: {result['medicines']}")
        print(f"Patient Info: {result['patient_info']}")
        print(f"Date: {result['date']}")
        print(f"Confidence: {result['confidence']}")
        print(f"\nRaw Text:\n{result['raw_text'][:500]}...")
    else:
        print("Usage: python ocr_utils_enhanced.py <image_path>")

