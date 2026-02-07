"""
Advanced OCR for Handwritten Prescriptions
Includes image preprocessing, fuzzy matching, and validation
"""

import subprocess
import re
import os
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Try to import PIL for image preprocessing
try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("PIL/Pillow not available. Image preprocessing disabled.")

# Try to import OpenCV for advanced preprocessing
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV not available. Advanced image preprocessing disabled.")


def preprocess_image_for_handwriting(image_path: str) -> str:
    """
    Preprocess image for better OCR on handwritten text
    
    Args:
        image_path: Path to the prescription image
        
    Returns:
        str: Path to preprocessed image (temporary file)
    """
    if not os.path.exists(image_path):
        return image_path
    
    try:
        if CV2_AVAILABLE:
            return _preprocess_with_opencv(image_path)
        elif PIL_AVAILABLE:
            return _preprocess_with_pil(image_path)
        else:
            return image_path
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        return image_path


def _preprocess_with_opencv(image_path: str) -> str:
    """Preprocess image using OpenCV for best results"""
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        return image_path
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        blurred, 255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 
        11, 2
    )
    
    # Morphological operations to clean up
    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    # Save to temporary file
    temp_path = image_path + "_preprocessed.jpg"
    cv2.imwrite(temp_path, cleaned)
    
    return temp_path


def _preprocess_with_pil(image_path: str) -> str:
    """Preprocess image using PIL as fallback"""
    img = Image.open(image_path)
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.5)
    
    # Apply mild blur to reduce noise
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    # Save to temporary file
    temp_path = image_path + "_preprocessed.jpg"
    img.save(temp_path, quality=95)
    
    return temp_path


def extract_with_tesseract_handwriting(image_path: str) -> Tuple[str, float]:
    """
    Extract text using Tesseract optimized for handwriting
    
    Args:
        image_path: Path to the image
        
    Returns:
        Tuple of (extracted_text, confidence_score)
    """
    if not os.path.exists(image_path):
        return "", 0.0
    
    best_text = ""
    best_confidence = 0.0
    
    # Try multiple PSM modes optimized for handwriting
    psm_modes = [
        ('6', 1.0),   # Uniform block of text - best for prescriptions
        ('3', 0.9),   # Fully automatic page segmentation
        ('4', 0.8),   # Assume single column of variable text
        ('8', 0.7),   # Treat as single word
    ]
    
    for psm, weight in psm_modes:
        try:
            result = subprocess.run([
                'tesseract', image_path, 'stdout',
                '-l', 'eng',
                '--psm', psm,
                '--oem', '3',  # LSTM engine
                '-c', 'preserve_interword_spaces=1',
                '-c', 'tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;-()[]{}@#$/&%+*= ',
                '-c', 'tessedit_write_images=false',
                '-c', 'textord_heavy_nr=1',  # Heavy noise reduction
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                text = result.stdout.strip()
                
                # Calculate confidence based on text quality
                confidence = _calculate_text_confidence(text) * weight
                
                if confidence > best_confidence and len(text) > 10:
                    best_text = text
                    best_confidence = confidence
                    
        except Exception as e:
            logger.warning(f"Tesseract failed with PSM {psm}: {e}")
            continue
    
    return best_text, best_confidence


def _calculate_text_confidence(text: str) -> float:
    """Calculate confidence score based on text characteristics"""
    if not text:
        return 0.0
    
    score = 0.0
    total_checks = 5
    
    # Check 1: Has reasonable length
    if len(text) > 20:
        score += 1.0
    elif len(text) > 10:
        score += 0.5
    
    # Check 2: Contains recognizable words
    words = text.split()
    if len(words) >= 3:
        score += 1.0
    elif len(words) >= 1:
        score += 0.5
    
    # Check 3: Has proper capitalization
    capitalized_words = sum(1 for w in words if w and w[0].isupper())
    if capitalized_words >= 2:
        score += 1.0
    
    # Check 4: Contains numbers (likely dosages, dates)
    if re.search(r'\d+', text):
        score += 1.0
    
    # Check 5: Has medical keywords
    medical_keywords = ['dr', 'doctor', 'mg', 'ml', 'tablet', 'capsule', 'prescription', 'rx']
    if any(kw in text.lower() for kw in medical_keywords):
        score += 1.0
    
    return score / total_checks


# Common doctor names database for Nepal (expandable)
COMMON_DOCTOR_NAMES = [
    'Ram', 'Shyam', 'Hari', 'Krishna', 'Gopal', 'Shiva', 'Bishnu',
    'Laxmi', 'Sita', 'Gita', 'Rita', 'Sunita', 'Anita', 'Sarita',
    'Prasad', 'Sharma', 'Lama', 'Sherpa', 'Rai', 'Gurung', 'Magar',
    'Thapa', 'Karki', 'Adhikari', 'Poudel', 'Bhattarai', 'Dahal',
    'Khanal', 'Neupane', 'Pokharel', 'Bhandari', 'Gautam', 'Joshi',
    'Koirala', 'Mishra', 'Pandey', 'Pathak', 'Regmi', 'Subedi',
    'Aryal', 'Bhusal', 'Chaudhary', 'Dhakal', 'Ghimire', 'Khatri',
    'Maharjan', 'Manandhar', 'Newar', 'Shakya', 'Singh', 'Tamang',
    'Yadav', 'Raj', 'Kumar', 'Pradhan', 'Basnet', 'Bista', 'Bohara',
    'Budhathoki', 'Chapagain', 'Dangi', 'Devkota', 'Dhamala', 'Giri',
    'Humagain', 'Kafle', 'Kandel', 'Kunwar', 'Lamsal', 'Luitel',
    'Mainali', 'Niraula', 'Oli', 'Panta', 'Parajuli', 'Rana', 'Raut',
    'Sah', 'Sapkota', 'Sedhain', 'Sijapati', 'Simkhada', 'Tiwari',
    'Upadhyaya', 'Wagle', 'Wosti'
]


def fuzzy_match_doctor_name(extracted_name: str) -> Tuple[str, float]:
    """
    Fuzzy match extracted name against common doctor names
    
    Args:
        extracted_name: Name extracted by OCR
        
    Returns:
        Tuple of (matched_name, confidence_score)
    """
    if not extracted_name:
        return "", 0.0
    
    # Clean the name
    name = extracted_name.strip()
    name = re.sub(r'[^\w\s]', '', name)  # Remove special chars
    name_parts = name.split()
    
    if len(name_parts) < 1:
        return "", 0.0
    
    best_match = name
    best_score = 0.5  # Base confidence for original extraction
    
    # Check each part against common names
    for part in name_parts:
        part_lower = part.lower()
        for common_name in COMMON_DOCTOR_NAMES:
            # Exact match
            if part_lower == common_name.lower():
                best_score = max(best_score, 0.9)
                break
            
            # Substring match
            if part_lower in common_name.lower() or common_name.lower() in part_lower:
                best_score = max(best_score, 0.7)
    
    # Boost confidence for valid name patterns
    if len(name_parts) >= 2:  # First and last name
        best_score += 0.1
    
    if all(p[0].isupper() for p in name_parts if p):  # Proper capitalization
        best_score += 0.1
    
    return best_match, min(best_score, 1.0)


def validate_doctor_name(name: str) -> Tuple[bool, float]:
    """
    Validate if extracted text is likely a doctor name
    
    Args:
        name: Extracted name
        
    Returns:
        Tuple of (is_valid, confidence_score)
    """
    if not name:
        return False, 0.0
    
    score = 0.0
    
    # Check length
    if len(name) >= 3:
        score += 0.2
    
    # Check for at least 2 words (first + last name)
    words = name.split()
    if len(words) >= 2:
        score += 0.2
    
    # Check capitalization
    if words and words[0][0].isupper():
        score += 0.1
    
    # Check for numbers (invalid in names)
    if not re.search(r'\d', name):
        score += 0.2
    else:
        score -= 0.3
    
    # Check for special characters
    if re.match(r'^[A-Za-z\s\.\-]+$', name):
        score += 0.2
    
    # Check against common names
    _, fuzzy_score = fuzzy_match_doctor_name(name)
    score += fuzzy_score * 0.1
    
    is_valid = score >= 0.5
    return is_valid, min(score, 1.0)


# Common medicines database with variations
COMMON_MEDICINES = {
    'amoxicillin': ['amox', 'amoxicilin', 'amoxycillin'],
    'azithromycin': ['azithro', 'azi', 'zithromax'],
    'ciprofloxacin': ['cipro', 'cipra', 'ciproflox'],
    'paracetamol': ['paracet', 'pcm', 'acetaminophen', 'calpol', 'crocin'],
    'ibuprofen': ['ibrufen', 'ibup', 'brufen', 'motrin', 'advil'],
    'diclofenac': ['diclo', 'voltaren', 'cataflam'],
    'pantoprazole': ['panto', 'protonix', 'pantocid'],
    'omeprazole': ['omep', 'prilosec', 'omez'],
    'ranitidine': ['rani', 'zantac'],
    'domperidone': ['domper', 'motilium'],
    'ondansetron': ['ondem', 'zofran'],
    'metoclopramide': ['metoclo', 'reglan'],
    'salbutamol': ['salbu', 'ventolin', 'albuterol'],
    'budesonide': ['bude', 'pulmicort'],
    'montelukast': ['monte', 'singulair'],
    'cetirizine': ['ceti', 'zyrtec'],
    'loratadine': ['lorat', 'claritin'],
    'fexofenadine': ['fexo', 'allegra'],
    'diphenhydramine': ['diphen', 'benadryl'],
    'metformin': ['metfo', 'glucophage'],
    'glibenclamide': ['gliben', 'daonil', 'glyburide'],
    'glimepiride': ['glim', 'amaryl'],
    'amlodipine': ['amlo', 'norvasc'],
    'atenolol': ['aten', 'tenormin'],
    'metoprolol': ['metro', 'lopressor', 'betaloc'],
    'losartan': ['losar', 'cozaar'],
    'enalapril': ['enal', 'vasotec'],
    'atorvastatin': ['atorva', 'lipitor'],
    'rosuvastatin': ['rosuva', 'crestor'],
    'simvastatin': ['simva', 'zocor'],
    'aspirin': ['aspri', 'ecosprin', 'disprin'],
    'clopidogrel': ['clopi', 'plavix'],
    'warfarin': ['warf', 'coumadin'],
    'diazepam': ['diaz', 'valium'],
    'alprazolam': ['alpra', 'xanax'],
    'clonazepam': ['clona', 'klonopin', 'rivotril'],
    'sertraline': ['sert', 'zoloft'],
    'fluoxetine': ['fluox', 'prozac'],
    'escitalopram': ['escita', 'lexapro'],
    'amitriptyline': ['amitrip', 'elavil'],
    'haloperidol': ['halop', 'haldol'],
    'tramadol': ['tram', 'ultram'],
    'morphine': ['morph', 'ms contin'],
    'codeine': ['code', 'cod'],
    'vitamin': ['vit', 'vita'],
    'multivitamin': ['multi', 'mv'],
    'calcium': ['cal', 'calci'],
    'iron': ['fe', 'ferrous'],
    'folic acid': ['folic', 'folate', 'b9'],
    'vitamin b12': ['b12', 'cobalamin', 'methylcobalamin'],
    'vitamin d': ['d3', 'cholecalciferol', 'vit d'],
    'zinc': ['zn'],
    'magnesium': ['mag', 'mg'],
    'vitamin c': ['vit c', 'ascorbic', 'c'],
    'ors': ['oral rehydration', 'electrolyte'],
    'smecta': ['smect', 'diosmectite'],
    'loperamide': ['lope', 'imodium'],
    'ciprofloxacin eye': ['cipro eye', 'ciprocin'],
    'ofloxacin eye': ['oflo eye', 'oflox eye'],
    'tobramycin': ['tobra', 'tobrex'],
    'gentamicin': ['genta', 'garamycin'],
    'mupirocin': ['mupi', 'bactroban'],
    'clotrimazole': ['clotri', 'canesten', 'lotrimin'],
    'terbinafine': ['terbi', 'lamisil'],
    'hydrocortisone': ['hydro', 'cortisone'],
    'betamethasone': ['beta', 'betnovate'],
    'dexamethasone': ['dexa', 'decadron'],
    'prednisolone': ['predni', 'pred', 'prednisone'],
    'insulin': ['ins', 'novorapid', 'humalog', 'lantus'],
}


def extract_medicine_from_handwriting(text: str) -> List[Dict]:
    """
    Extract medicines from text with fuzzy matching
    
    Args:
        text: OCR extracted text
        
    Returns:
        List of medicine dictionaries
    """
    medicines = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Try to match against medicine database
        line_lower = line.lower()
        
        for standard_name, variations in COMMON_MEDICINES.items():
            # Check if any variation matches
            matched = False
            for var in variations + [standard_name]:
                if var in line_lower:
                    matched = True
                    break
            
            if matched or standard_name in line_lower:
                # Extract dosage and frequency
                medicine = {
                    'name': standard_name.capitalize(),
                    'dosage': extract_dosage(line),
                    'frequency': extract_frequency(line),
                    'duration': extract_duration(line),
                    'confidence': 'high' if standard_name in line_lower else 'medium'
                }
                
                # Avoid duplicates
                if not any(m['name'].lower() == medicine['name'].lower() for m in medicines):
                    medicines.append(medicine)
                break
    
    # Also try pattern-based extraction for unknown medicines
    pattern_medicines = extract_medicines_by_pattern(text)
    
    # Add pattern-extracted medicines not already in list
    for med in pattern_medicines:
        if not any(m['name'].lower() == med['name'].lower() for m in medicines):
            medicines.append(med)
    
    return medicines


def extract_dosage(text: str) -> str:
    """Extract dosage information from text"""
    patterns = [
        r'(\d+\s*(?:mg|ml|g|mcg|IU|%|units?))',
        r'(\d+\s*(?:tablet|tab|capsule|cap|drop|spray|inhalation|puff|ml|cc))',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return ""


def extract_frequency(text: str) -> str:
    """Extract frequency information from text"""
    patterns = [
        (r'\b(OD|o\.d\.|once\s*daily)\b', 'OD'),
        (r'\b(BD|b\.d\.|twice\s*daily|bid)\b', 'BD'),
        (r'\b(TID|t\.i\.d\.|three\s*times|tds)\b', 'TID'),
        (r'\b(QID|q\.i\.d\.|four\s*times)\b', 'QID'),
        (r'\b(PRN|prn|as\s*needed|sos)\b', 'PRN'),
        (r'\b(QH|q\.h\.|every\s*hour)\b', 'QH'),
        (r'\b(Q\d+H|q\d+h|every\s*\d+\s*hours?)\b', 'QH'),
        (r'\b(before\s*breakfast|ac|a\.c\.)\b', 'Before breakfast'),
        (r'\b(after\s*food|pc|p\.c\.|after\s*meals)\b', 'After food'),
        (r'\b(before\s*sleep|hs|h\.s\.|bedtime)\b', 'Before sleep'),
    ]
    
    for pattern, standard in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return standard
    
    return ""


def extract_duration(text: str) -> str:
    """Extract duration information from text"""
    patterns = [
        r'(\d+\s*(?:days?|dys?|d))',
        r'(\d+\s*(?:weeks?|wks?|w))',
        r'(\d+\s*(?:months?|mos?|m))',
        r'for\s+(\d+\s*(?:days?|weeks?|months?))',
        r'x\s*(\d+\s*(?:d|w|m|days?|weeks?|months?))',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            duration = match.group(1).strip()
            # Clean up the duration
            duration = re.sub(r'(?<=\d)(?=[a-zA-Z])', ' ', duration)
            return duration
    
    return ""


def extract_medicines_by_pattern(text: str) -> List[Dict]:
    """Extract medicines using regex patterns when database matching fails"""
    medicines = []
    
    # Pattern: Number. Medicine Name Dosage
    pattern = r'(?:^|\n|\d[\.\)]\s*)([A-Z][a-z]+(?:\s+[A-Za-z]+)?)\s*(\d+\s*(?:mg|ml|g|mcg)?)?'
    
    matches = re.finditer(pattern, text)
    for match in matches:
        name = match.group(1).strip()
        dosage = match.group(2) if match.group(2) else ""
        
        # Validate it looks like a medicine
        if len(name) >= 3 and not any(x in name.lower() for x in ['the', 'and', 'for', 'with']):
            medicines.append({
                'name': name,
                'dosage': dosage,
                'frequency': extract_frequency(text[match.end():match.end()+50]),
                'duration': extract_duration(text[match.end():match.end()+50]),
                'confidence': 'low'
            })
    
    return medicines


def extract_nmc_number(text: str) -> Optional[str]:
    """Extract NMC number with improved patterns"""
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
        r'NMC\s*#?\s*(\d{4,7})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            nmc = match.group(1)
            if nmc and len(nmc) >= 4 and len(nmc) <= 7:
                return nmc
    
    return None


def extract_hospital_name(text: str) -> Optional[str]:
    """Extract hospital/clinic name"""
    patterns = [
        r'(?:Hospital|Clinic|Medical\s*Center|Health\s*Center|Hospital\s*Name|Center)[\s:]*([A-Z][A-Za-z\s&]+?(?:Hospital|Clinic|Medical|Center|Health)?)',
        r'([A-Z][A-Za-z\s&]+?(?:Hospital|Clinic|Medical\s*Center|Health\s*Center))',
        r'(?:At|From)[\s]+([A-Z][A-Za-z\s&]+)',
        r'(?:At|From|in)\s+([A-Z][A-Za-z\s&]+(?:Hospital|Clinic|Medical|Center|Health))',
        r'([A-Z][A-Za-z\s&]+(?:Hospital|Clinic|Medical|Center|Health|Institute))',
        r'(?:Hospital|Clinic)\s*Name\s*:?\s*([A-Z][A-Za-z\s&]+)',
        r'(?:Dept?|Department)\s+of\s+([A-Z][A-Za-z\s&]+(?:Hospital|Clinic))?',
        r'(?:Address|Location)[\s:]+([A-Z][A-Za-z\s&]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            name = re.sub(r'\s+', ' ', name)
            name = re.sub(r'[^\w\s&]', '', name)
            if len(name) > 3 and len(name) < 100:
                return name
    
    return None


def extract_department(text: str) -> Optional[str]:
    """Extract department/specialty"""
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
    
    for dept in departments:
        pattern = r'\b' + re.escape(dept.lower()) + r'\b'
        if re.search(pattern, text_lower):
            return dept
    
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
            if dept in departments or len(dept) > 2:
                return dept
    
    return None


def extract_patient_info(text: str) -> Dict:
    """Extract patient information"""
    patient_info = {}
    
    # Name patterns
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
        r'\b(Male|Female|M|F)\b',
        r'\b(Gentleman|Lady|Woman|Man)\b',
    ]
    
    for pattern in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender = match.group(1).strip()
            patient_info['gender'] = gender.capitalize()
            break
    
    return patient_info


def extract_date(text: str) -> Optional[str]:
    """Extract date from prescription"""
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})',
        r'Date\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'Date\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})',
        r'(?:Date|Dated)[\s:]+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})',
        r'(\d{1,2}(?:st|nd|rd|th)?\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s*\d{2,4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date = match.group(1)
            date = re.sub(r'\s+', ' ', date).strip()
            return date
    
    return None


def extract_followup_date(text: str) -> Optional[str]:
    """Extract follow-up date"""
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


def extract_complaints(text: str) -> Optional[str]:
    """Extract chief complaints"""
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


def extract_doctor_name(text: str) -> Optional[str]:
    """
    Extract doctor name with validation and fuzzy matching
    """
    # First try standard patterns
    patterns = [
        r'(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
        r'(?:Dr\.?|Doctor)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
        r'Name\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
        r'Recommended\s*(?:by)?\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
        r'Prescribed\s*(?:by)?\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
        r'Signature\s*:?\s*(?:Dr\.?|Doctor)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
    ]
    
    candidates = []
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            name = match.group(1).strip()
            # Clean the name
            name = re.sub(r'[^\w\s]', '', name).strip()
            name = re.sub(r'\s+', ' ', name)
            
            # Validate and score
            is_valid, confidence = validate_doctor_name(name)
            if is_valid:
                candidates.append((name, confidence))
    
    # Return the best candidate
    if candidates:
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]
    
    return None


def calculate_overall_confidence(extracted_data: Dict) -> str:
    """
    Calculate overall confidence level based on extracted data
    
    Args:
        extracted_data: Dictionary containing all extracted information
        
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
        value = extracted_data.get(field)
        if value:
            if field == 'medicines' and isinstance(value, list) and len(value) > 0:
                score += 2
            elif field == 'patient_info' and isinstance(value, dict) and value:
                score += 2
            else:
                score += 2
    
    percentage = (score / max_score) * 100 if max_score > 0 else 0
    
    if percentage >= 70:
        return 'high'
    elif percentage >= 40:
        return 'medium'
    else:
        return 'low'


def enhanced_analyze_prescription(image_path: str) -> Dict:
    """
    Main function to analyze prescription with advanced OCR
    
    Args:
        image_path: Path to the prescription image
        
    Returns:
        Dictionary containing all extracted information
    """
    try:
        # Step 1: Preprocess image
        preprocessed_path = preprocess_image_for_handwriting(image_path)
        
        # Step 2: Extract text with Tesseract
        raw_text, ocr_confidence = extract_with_tesseract_handwriting(preprocessed_path)
        
        if not raw_text:
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
        
        # Step 3: Extract all information
        nmc_number = extract_nmc_number(raw_text)
        doctor_name = extract_doctor_name(raw_text)
        hospital_name = extract_hospital_name(raw_text)
        department = extract_department(raw_text)
        medicines = extract_medicine_from_handwriting(raw_text)
        patient_info = extract_patient_info(raw_text)
        date = extract_date(raw_text)
        followup_date = extract_followup_date(raw_text)
        complaints = extract_complaints(raw_text)
        
        # Step 4: Calculate overall confidence
        extracted_data = {
            'nmc_number': nmc_number,
            'doctor_name': doctor_name,
            'hospital_name': hospital_name,
            'department': department,
            'medicines': medicines,
            'patient_info': patient_info,
            'date': date,
        }
        
        overall_confidence = calculate_overall_confidence(extracted_data)
        
        # Adjust confidence based on OCR quality
        if ocr_confidence < 0.3:
            overall_confidence = 'low'
        elif ocr_confidence < 0.6 and overall_confidence == 'high':
            overall_confidence = 'medium'
        
        # Clean up preprocessed file if different from original
        if preprocessed_path != image_path and os.path.exists(preprocessed_path):
            try:
                os.unlink(preprocessed_path)
            except:
                pass
        
        return {
            'success': True,
            'raw_text': raw_text,
            'nmc_number': nmc_number,
            'doctor_name': doctor_name,
            'hospital_name': hospital_name,
            'department': department,
            'medicines': medicines,
            'patient_info': patient_info,
            'date': date,
            'followup_date': followup_date,
            'complaints': complaints,
            'confidence': overall_confidence,
            'ocr_confidence': ocr_confidence,
            'error': None
        }
        
    except Exception as e:
        logger.error(f"Enhanced OCR analysis failed: {e}")
        return {
            'success': False,
            'error': str(e),
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


# Alias for backward compatibility
analyze_prescription = enhanced_analyze_prescription


if __name__ == '__main__':
    # Test with a sample image
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        result = enhanced_analyze_prescription(image_path)
        
        print("=" * 60)
        print("Enhanced OCR Analysis Results")
        print("=" * 60)
        print(f"Success: {result['success']}")
        print(f"Confidence: {result['confidence']}")
        print(f"OCR Confidence: {result.get('ocr_confidence', 'N/A')}")
        print(f"\nNMC Number: {result['nmc_number']}")
        print(f"Doctor Name: {result['doctor_name']}")
        print(f"Hospital Name: {result['hospital_name']}")
        print(f"Department: {result['department']}")
        print(f"\nMedicines ({len(result['medicines'])}):")
        for med in result['medicines']:
            print(f"  - {med['name']} {med['dosage']} {med['frequency']} {med['duration']}")
        print(f"\nPatient Info: {result['patient_info']}")
        print(f"Date: {result['date']}")
        print(f"Follow-up: {result['followup_date']}")
        print(f"\nRaw Text (first 500 chars):\n{result['raw_text'][:500]}...")
        
        if result['error']:
            print(f"\nError: {result['error']}")
    else:
        print("Usage: python advanced_ocr_handwriting.py <image_path>")
