"""
OCR Accuracy Evaluator
Enhanced accuracy testing with weighted scoring, batch testing, and reporting
Suitable for final year project defense
"""

import json
import csv
from datetime import datetime
from difflib import SequenceMatcher
from typing import Dict, List, Any, Tuple, Optional


def calculate_similarity(str1: str, str2: str) -> float:
    """
    Calculate string similarity using SequenceMatcher.
    Returns similarity ratio between 0.0 and 1.0
    """
    if not str1 or not str2:
        return 0.0
    
    # Normalize strings: lowercase, strip whitespace
    s1 = str(str1).lower().strip()
    s2 = str(str2).lower().strip()
    
    return SequenceMatcher(None, s1, s2).ratio()


def fuzzy_match(value1: Any, value2: Any, threshold: float = 0.8) -> bool:
    """
    Fuzzy match two values with given threshold.
    Returns True if similarity >= threshold.
    """
    if not value1 or not value2:
        return False
    
    similarity = calculate_similarity(str(value1), str(value2))
    return similarity >= threshold


def match_medicines(extracted: List[Dict], expected: List[Dict]) -> Tuple[float, Dict]:
    """
    Compare extracted medicines with expected medicines.
    Returns accuracy score and detailed results.
    """
    if not expected:
        return 0.0, {"matched": 0, "total": 0, "accuracy": 0.0}
    
    if not extracted:
        return 0.0, {"matched": 0, "total": len(expected), "accuracy": 0.0}
    
    matched_count = 0
    matched_details = []
    
    # Create copies to track which expected medicines are found
    expected_remaining = expected.copy()
    
    for ext_med in extracted:
        ext_name = ext_med.get('name', '').lower().strip()
        
        # Try to find matching expected medicine
        for i, exp_med in enumerate(expected_remaining):
            exp_name = exp_med.get('name', '').lower().strip()
            
            # Check if medicine names match (fuzzy match at 70% for medicines)
            if calculate_similarity(ext_name, exp_name) >= 0.7:
                matched_count += 1
                matched_details.append({
                    "extracted": ext_med,
                    "expected": exp_med,
                    "match": True
                })
                # Remove from remaining to avoid double counting
                expected_remaining.pop(i)
                break
    
    # Calculate partial accuracy
    total_expected = len(expected)
    accuracy = (matched_count / total_expected) * 100 if total_expected > 0 else 0.0
    
    details = {
        "matched": matched_count,
        "total": total_expected,
        "accuracy": round(accuracy, 2),
        "details": matched_details
    }
    
    return accuracy, details


def get_confidence_label(accuracy: float) -> str:
    """
    Determine confidence label based on accuracy percentage.
    """
    if accuracy >= 85:
        return "High"
    elif accuracy >= 60:
        return "Medium"
    else:
        return "Low"


def get_weighted_score(field: str, score: float) -> float:
    """
    Apply field-specific weights for weighted accuracy calculation.
    Critical fields (NMC number) have higher weight.
    """
    weights = {
        'nmc_number': 2.0,      # Critical - must be exact
        'doctor_name': 1.5,     # Very important
        'department': 1.2,      # Important
        'hospital_name': 1.0,   # Standard
        'medicines': 1.0        # Standard
    }
    return score * weights.get(field, 1.0)


def generate_bar_chart(label: str, percentage: float, width: int = 40) -> str:
    """
    Generate a simple ASCII bar chart.
    """
    filled = int((percentage / 100) * width)
    bar = '█' * filled + '░' * (width - filled)
    return f"{label:<20} {bar} {percentage:>5.1f}%"


def test_ocr_accuracy(extracted: Dict, expected: Dict, test_id: str = "") -> Dict:
    """
    Evaluate OCR accuracy by comparing extracted data with expected (ground truth) data.
    
    Args:
        extracted: Dictionary containing OCR extracted fields
        expected: Dictionary containing ground truth fields
        test_id: Optional identifier for this test case
    
    Returns:
        Dictionary with overall accuracy, field-level results, and confidence label
    """
    
    # Define fields and their matching strategies
    field_configs = {
        'doctor_name': {'type': 'fuzzy', 'threshold': 0.8},
        'nmc_number': {'type': 'exact'},
        'hospital_name': {'type': 'fuzzy', 'threshold': 0.8},
        'department': {'type': 'exact'},
        'medicines': {'type': 'list'}
    }
    
    field_results = {}
    scores = []
    weighted_scores = []
    
    # Evaluate each field
    for field, config in field_configs.items():
        ext_value = extracted.get(field)
        exp_value = expected.get(field)
        
        if config['type'] == 'fuzzy':
            # Fuzzy matching for names
            similarity = calculate_similarity(ext_value, exp_value) if ext_value and exp_value else 0.0
            is_match = similarity >= config['threshold']
            score = 100.0 if is_match else similarity * 100  # Partial credit for close matches
            
            field_results[field] = {
                'match': is_match,
                'score': round(score, 2),
                'extracted': ext_value,
                'expected': exp_value,
                'similarity': round(similarity * 100, 2)
            }
            scores.append(score)
            weighted_scores.append(get_weighted_score(field, score))
            
        elif config['type'] == 'exact':
            # Exact matching for NMC and department
            is_match = (str(ext_value).lower().strip() == str(exp_value).lower().strip()) if ext_value and exp_value else False
            score = 100.0 if is_match else 0.0
            
            field_results[field] = {
                'match': is_match,
                'score': score,
                'extracted': ext_value,
                'expected': exp_value
            }
            scores.append(score)
            weighted_scores.append(get_weighted_score(field, score))
            
        elif config['type'] == 'list':
            # Simple medicines presence check (not detailed matching)
            ext_list = ext_value if isinstance(ext_value, list) else []
            exp_list = exp_value if isinstance(exp_value, list) else []
            
            # Simple accuracy: what percentage of expected medicines were found
            if not exp_list:
                accuracy = 0.0
            else:
                # Count how many expected medicines have matching names
                matched = 0
                for exp_med in exp_list:
                    exp_name = exp_med.get('name', '').lower().strip()
                    for ext_med in ext_list:
                        ext_name = ext_med.get('name', '').lower().strip()
                        if calculate_similarity(ext_name, exp_name) >= 0.7:
                            matched += 1
                            break
                accuracy = (matched / len(exp_list)) * 100
            
            field_results[field] = {
                'match': accuracy >= 80,
                'score': round(accuracy, 2),
                'extracted_count': len(ext_list),
                'expected_count': len(exp_list),
                'matched_count': matched if exp_list else 0
            }
            scores.append(accuracy)
            weighted_scores.append(get_weighted_score(field, accuracy))
    
    # Calculate overall accuracy (simple average)
    overall_accuracy = round(sum(scores) / len(scores), 2) if scores else 0.0
    
    # Calculate weighted accuracy
    max_weighted = sum(get_weighted_score(f, 100) for f in field_configs.keys())
    weighted_accuracy = round(sum(weighted_scores) / max_weighted * 100, 2) if max_weighted > 0 else 0.0
    
    # Determine confidence label
    confidence_label = get_confidence_label(weighted_accuracy)
    
    return {
        'test_id': test_id,
        'timestamp': datetime.now().isoformat(),
        'overall_accuracy': overall_accuracy,
        'weighted_accuracy': weighted_accuracy,
        'confidence_label': confidence_label,
        'field_results': field_results,
        'total_fields': len(field_configs),
        'summary': {
            'high_confidence_fields': sum(1 for s in scores if s >= 85),
            'medium_confidence_fields': sum(1 for s in scores if 60 <= s < 85),
            'low_confidence_fields': sum(1 for s in scores if s < 60)
        }
    }


def batch_test_ocr(test_cases: List[Dict]) -> Dict:
    """
    Run OCR accuracy tests on multiple prescriptions.
    
    Args:
        test_cases: List of dictionaries with 'extracted', 'expected', and optional 'id' keys
    
    Returns:
        Aggregate statistics across all test cases
    """
    results = []
    
    for case in test_cases:
        test_id = case.get('id', f"test_{len(results) + 1}")
        result = test_ocr_accuracy(case['extracted'], case['expected'], test_id)
        results.append(result)
    
    # Calculate aggregate statistics
    accuracies = [r['weighted_accuracy'] for r in results]
    avg_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else 0.0
    
    # Field-level aggregate
    field_stats = {}
    for field in ['doctor_name', 'nmc_number', 'hospital_name', 'department', 'medicines']:
        field_scores = [r['field_results'][field]['score'] for r in results if field in r['field_results']]
        field_stats[field] = {
            'average': round(sum(field_scores) / len(field_scores), 2) if field_scores else 0.0,
            'min': min(field_scores) if field_scores else 0.0,
            'max': max(field_scores) if field_scores else 0.0
        }
    
    return {
        'total_tests': len(results),
        'average_accuracy': avg_accuracy,
        'overall_confidence': get_confidence_label(avg_accuracy),
        'individual_results': results,
        'field_statistics': field_stats,
        'timestamp': datetime.now().isoformat()
    }


def export_results_to_json(result: Dict, filename: str = "ocr_accuracy_results.json") -> None:
    """
    Export accuracy results to JSON file for documentation.
    """
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"Results exported to: {filename}")


def export_results_to_csv(results: List[Dict], filename: str = "ocr_accuracy_results.csv") -> None:
    """
    Export batch test results to CSV file.
    """
    if not results:
        print("No results to export")
        return
    
    # Get field names from first result
    field_names = list(results[0]['field_results'].keys())
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Header
        header = ['Test ID', 'Overall Accuracy', 'Weighted Accuracy', 'Confidence']
        for field in field_names:
            header.append(f"{field}_score")
            header.append(f"{field}_match")
        writer.writerow(header)
        
        # Data rows
        for result in results:
            row = [
                result.get('test_id', ''),
                result['overall_accuracy'],
                result['weighted_accuracy'],
                result['confidence_label']
            ]
            for field in field_names:
                field_data = result['field_results'].get(field, {})
                row.append(field_data.get('score', 0))
                row.append('Yes' if field_data.get('match') else 'No')
            writer.writerow(row)
    
    print(f"Results exported to: {filename}")


def print_accuracy_report(result: Dict, show_charts: bool = True) -> None:
    """
    Print a formatted accuracy report to console.
    Useful for quick testing and demonstrations.
    """
    print("\n" + "=" * 70)
    print("OCR ACCURACY EVALUATION REPORT")
    print("=" * 70)
    
    if result.get('test_id'):
        print(f"Test ID: {result['test_id']}")
    if result.get('timestamp'):
        print(f"Timestamp: {result['timestamp']}")
    
    print(f"\nOverall Accuracy: {result['overall_accuracy']}%")
    if 'weighted_accuracy' in result:
        print(f"Weighted Accuracy: {result['weighted_accuracy']}% (Critical fields weighted higher)")
    print(f"Confidence Level: {result['confidence_label']}")
    
    print("\nField-Level Results:")
    print("-" * 70)
    
    if show_charts:
        print("\nAccuracy by Field:")
        for field, data in result['field_results'].items():
            score = data.get('score', 0)
            print(generate_bar_chart(field.replace('_', ' ').title(), score))
    
    print("\nDetailed Results:")
    print("-" * 70)
    
    for field, data in result['field_results'].items():
        status = "✓ PASS" if data.get('match') else "✗ FAIL"
        score = data.get('score', 0)
        
        print(f"\n{field.upper().replace('_', ' '):<20} {status} ({score:.1f}%)")
        
        if 'similarity' in data:
            print(f"  Similarity: {data['similarity']}%")
        
        if 'extracted' in data and 'expected' in data:
            print(f"  Extracted:  {data['extracted']}")
            print(f"  Expected:   {data['expected']}")
        
        if 'matched_count' in data:
            print(f"  Matched: {data['matched_count']}/{data['expected_count']} medicines")
    
    print("\n" + "=" * 70)
    print(f"Summary: {result['summary']['high_confidence_fields']} High | "
          f"{result['summary']['medium_confidence_fields']} Medium | "
          f"{result['summary']['low_confidence_fields']} Low")
    print("=" * 70 + "\n")


def print_batch_report(batch_result: Dict) -> None:
    """
    Print aggregate report for batch testing.
    """
    print("\n" + "=" * 70)
    print("BATCH OCR ACCURACY REPORT")
    print("=" * 70)
    print(f"Total Tests: {batch_result['total_tests']}")
    print(f"Average Accuracy: {batch_result['average_accuracy']}%")
    print(f"Overall Confidence: {batch_result['overall_confidence']}")
    print(f"Timestamp: {batch_result['timestamp']}")
    
    print("\nField-Level Statistics:")
    print("-" * 70)
    for field, stats in batch_result['field_statistics'].items():
        print(f"\n{field.upper().replace('_', ' ')}:")
        print(f"  Average: {stats['average']:.1f}%")
        print(f"  Range: {stats['min']:.1f}% - {stats['max']:.1f}%")
        print(generate_bar_chart("  Average", stats['average']))
    
    print("\n" + "=" * 70)
    print("Individual Test Results:")
    print("-" * 70)
    for result in batch_result['individual_results']:
        status = "✓" if result['confidence_label'] == 'High' else "!" if result['confidence_label'] == 'Medium' else "✗"
        print(f"{status} {result.get('test_id', 'Unknown'):<20} "
              f"Weighted: {result['weighted_accuracy']:>5.1f}% | "
              f"Simple: {result['overall_accuracy']:>5.1f}% | "
              f"{result['confidence_label']}")
    
    print("=" * 70 + "\n")


# Example usage and testing
if __name__ == '__main__':
    print("=" * 70)
    print("OCR ACCURACY EVALUATOR - DEMONSTRATION")
    print("=" * 70)
    
    # Sample test case 1 - Good accuracy
    test1_extracted = {
        'doctor_name': 'Dr. Ram Sharma',
        'nmc_number': '12345',
        'hospital_name': 'City Hospital Kathmandu',
        'department': 'Cardiology',
        'medicines': [
            {'name': 'Amoxicillin', 'dosage': '500mg', 'frequency': 'BD'},
            {'name': 'Paracetamol', 'dosage': '650mg', 'frequency': 'TID'}
        ]
    }
    
    test1_expected = {
        'doctor_name': 'Dr. Ram Sharma',
        'nmc_number': '12345',
        'hospital_name': 'City Hospital',
        'department': 'Cardiology',
        'medicines': [
            {'name': 'Amoxicillin', 'dosage': '500mg', 'frequency': 'BD'},
            {'name': 'Paracetamol', 'dosage': '650mg', 'frequency': 'TID'},
            {'name': 'Omeprazole', 'dosage': '20mg', 'frequency': 'OD'}
        ]
    }
    
    # Sample test case 2 - Poor accuracy
    test2_extracted = {
        'doctor_name': 'Dr. R Sharma',  # Missing name
        'nmc_number': '12346',  # Wrong number
        'hospital_name': 'City Hosp',  # Abbreviated
        'department': 'Cardio',  # Abbreviated
        'medicines': [
            {'name': 'Amox', 'dosage': '500mg', 'frequency': 'BD'}
        ]
    }
    
    test2_expected = {
        'doctor_name': 'Dr. Ram Sharma',
        'nmc_number': '12345',
        'hospital_name': 'City Hospital',
        'department': 'Cardiology',
        'medicines': [
            {'name': 'Amoxicillin', 'dosage': '500mg', 'frequency': 'BD'},
            {'name': 'Paracetamol', 'dosage': '650mg', 'frequency': 'TID'}
        ]
    }
    
    # Single test demonstration
    print("\n" + "=" * 70)
    print("SINGLE TEST DEMONSTRATION")
    print("=" * 70)
    
    result1 = test_ocr_accuracy(test1_extracted, test1_expected, "Test_001")
    print_accuracy_report(result1)
    
    # Export single result
    export_results_to_json(result1, "single_test_result.json")
    
    # Batch test demonstration
    print("\n" + "=" * 70)
    print("BATCH TEST DEMONSTRATION")
    print("=" * 70)
    
    test_cases = [
        {'id': 'Prescription_001', 'extracted': test1_extracted, 'expected': test1_expected},
        {'id': 'Prescription_002', 'extracted': test2_extracted, 'expected': test2_expected}
    ]
    
    batch_result = batch_test_ocr(test_cases)
    print_batch_report(batch_result)
    
    # Export batch results
    export_results_to_json(batch_result, "batch_test_results.json")
    export_results_to_csv(batch_result['individual_results'], "batch_test_results.csv")
    
    print("\n" + "=" * 70)
    print("DEMONSTRATION COMPLETE")
    print("Files generated:")
    print("  - single_test_result.json")
    print("  - batch_test_results.json")
    print("  - batch_test_results.csv")
    print("=" * 70)
