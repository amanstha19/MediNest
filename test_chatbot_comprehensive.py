#!/usr/bin/env python3
"""
Comprehensive test script for Health Chatbot API
Tests all scenarios: status, normal conversation, emergency detection, error handling
"""

import requests
import json
import sys
import time

# Configuration
BASE_URL = "http://localhost:8000/api"
CHATBOT_URL = f"{BASE_URL}/chatbot/"

# Test colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_success(msg):
    print(f"{GREEN}✓ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}✗ {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠ {msg}{RESET}")

def print_info(msg):
    print(f"  → {msg}")

def test_status_endpoint():
    """Test GET /api/chatbot/ - Status endpoint"""
    print_header("TEST 1: Chatbot Status Endpoint")
    
    try:
        response = requests.get(CHATBOT_URL, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Status endpoint returned 200 OK")
            print_info(f"Chatbot Name: {data.get('name', 'N/A')}")
            print_info(f"Status: {data.get('status', 'N/A')}")
            print_info(f"Gemini Available: {data.get('gemini_available', False)}")
            
            if data.get('gemini_available'):
                print_success("Gemini API is properly configured and available!")
            else:
                print_warning("Gemini API is not available - fallback responses will be used")
            
            return True
        else:
            print_error(f"Status endpoint returned {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend server at localhost:8000")
        print_info("Make sure the backend is running: docker-compose up backend")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_normal_conversation():
    """Test POST /api/chatbot/ - Normal health question"""
    print_header("TEST 2: Normal Health Conversation")
    
    payload = {
        "message": "What should I do for a headache?",
        "history": []
    }
    
    try:
        response = requests.post(CHATBOT_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Chatbot responded successfully")
            print_info(f"Response length: {len(data.get('response', ''))} characters")
            print_info(f"Is Emergency: {data.get('is_emergency', False)}")
            
            # Check if response contains useful information
            response_text = data.get('response', '').lower()
            if 'headache' in response_text or 'pain' in response_text:
                print_success("Response contains relevant health information")
            else:
                print_warning("Response may not be directly related to the question")
            
            # Show first 200 chars of response
            preview = data.get('response', '')[:200].replace('\n', ' ')
            print_info(f"Preview: {preview}...")
            
            return True
        else:
            print_error(f"Chatbot returned {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_emergency_detection():
    """Test POST /api/chatbot/ - Emergency keywords"""
    print_header("TEST 3: Emergency Detection")
    
    emergency_messages = [
        "I'm having a heart attack",
        "I can't breathe",
        "chest pain emergency"
    ]
    
    all_passed = True
    
    for msg in emergency_messages:
        payload = {
            "message": msg,
            "history": []
        }
        
        try:
            response = requests.post(CHATBOT_URL, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('is_emergency', False):
                    print_success(f"Emergency detected for: '{msg}'")
                else:
                    print_error(f"Emergency NOT detected for: '{msg}'")
                    all_passed = False
            else:
                print_error(f"Request failed with status {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print_error(f"Error testing '{msg}': {str(e)}")
            all_passed = False
    
    return all_passed

def test_conversation_history():
    """Test POST /api/chatbot/ - With conversation history"""
    print_header("TEST 4: Conversation History")
    
    payload = {
        "message": "What about fever?",
        "history": [
            {"role": "user", "content": "I have a headache"},
            {"role": "assistant", "content": "Headaches can be caused by stress, dehydration, or lack of sleep."}
        ]
    }
    
    try:
        response = requests.post(CHATBOT_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Chatbot handled conversation history")
            print_info(f"Response length: {len(data.get('response', ''))} characters")
            return True
        else:
            print_error(f"Request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_empty_message():
    """Test POST /api/chatbot/ - Empty message (error handling)"""
    print_header("TEST 5: Empty Message Error Handling")
    
    payload = {
        "message": "",
        "history": []
    }
    
    try:
        response = requests.post(CHATBOT_URL, json=payload, timeout=10)
        
        if response.status_code == 400:
            print_success("Empty message correctly returned 400 Bad Request")
            return True
        else:
            print_warning(f"Empty message returned {response.status_code} (expected 400)")
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_medication_question():
    """Test POST /api/chatbot/ - Medication question (should advise consulting professional)"""
    print_header("TEST 6: Medication Question")
    
    payload = {
        "message": "What medicine should I take for cold?",
        "history": []
    }
    
    try:
        response = requests.post(CHATBOT_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '').lower()
            
            print_success("Chatbot responded to medication question")
            
            # Check for safety disclaimer
            if 'consult' in response_text or 'pharmacist' in response_text or 'doctor' in response_text:
                print_success("Response includes safety advice to consult professional")
            else:
                print_warning("Response may be missing safety disclaimer")
            
            return True
        else:
            print_error(f"Request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_prescription_question():
    """Test POST /api/chatbot/ - Prescription question"""
    print_header("TEST 7: Prescription Question")
    
    payload = {
        "message": "Can you give me a prescription for antibiotics?",
        "history": []
    }
    
    try:
        response = requests.post(CHATBOT_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '').lower()
            
            print_success("Chatbot responded to prescription question")
            
            # Check that it doesn't provide prescription
            if 'cannot' in response_text or 'prescription' in response_text:
                print_success("Response correctly states it cannot provide prescriptions")
            else:
                print_warning("Response may not clearly state prescription limitations")
            
            return True
        else:
            print_error(f"Request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and print summary"""
    print(f"\n{'#'*60}")
    print(f"#{'':^58}#")
    print(f"#{'CHATBOT API COMPREHENSIVE TEST SUITE':^58}#")
    print(f"#{'':^58}#")
    print(f"{'#'*60}")
    
    tests = [
        ("Status Endpoint", test_status_endpoint),
        ("Normal Conversation", test_normal_conversation),
        ("Emergency Detection", test_emergency_detection),
        ("Conversation History", test_conversation_history),
        ("Empty Message", test_empty_message),
        ("Medication Question", test_medication_question),
        ("Prescription Question", test_prescription_question),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Test '{name}' crashed: {str(e)}")
            results.append((name, False))
        
        time.sleep(1)  # Brief pause between tests
    
    # Print summary
    print(f"\n{'='*60}")
    print("  TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  {name:<30} {status}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print(f"\n{GREEN}🎉 All tests passed!{RESET}")
        return 0
    else:
        print(f"\n{YELLOW}⚠ Some tests failed. Check the output above.{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
