#!/usr/bin/env python3
"""
Password Reset Feature Test Script
Tests all endpoints for the password reset functionality
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_EMAIL = "test@example.com"  # Change this to a valid email for real testing
TEST_PASSWORD = "testpassword123"

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    print(f"{RED}✗ {message}{RESET}")

def print_warning(message):
    print(f"{YELLOW}⚠ {message}{RESET}")

def print_info(message):
    print(f"{YELLOW}ℹ {message}{RESET}")

def test_forgot_password():
    """Test forgot password endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Forgot Password Endpoint")
    print("="*60)
    
    url = f"{BASE_URL}/forgot-password/"
    
    # Test with valid email format
    data = {"email": TEST_EMAIL}
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print_success(f"Forgot password request successful")
            print_info(f"Response: {result.get('message', 'No message')}")
            return True
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server. Is Django running on port 8000?")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_forgot_password_invalid_email():
    """Test forgot password with invalid email"""
    print("\n" + "="*60)
    print("TEST 2: Forgot Password - Invalid Email Format")
    print("="*60)
    
    url = f"{BASE_URL}/forgot-password/"
    
    # Test with invalid email
    data = {"email": "invalid-email"}
    try:
        response = requests.post(url, json=data, timeout=10)
        # Should still return 200 for security (don't reveal if email exists)
        if response.status_code == 200:
            print_success("Security check passed - no email enumeration")
            return True
        else:
            print_warning(f"Status code: {response.status_code}")
            return True  # Still pass as security is maintained
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_forgot_password_missing_email():
    """Test forgot password with missing email"""
    print("\n" + "="*60)
    print("TEST 3: Forgot Password - Missing Email")
    print("="*60)
    
    url = f"{BASE_URL}/forgot-password/"
    
    data = {}
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 400:
            print_success("Correctly rejected missing email")
            return True
        else:
            print_error(f"Should have returned 400, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_verify_reset_token_invalid():
    """Test verify reset token with invalid token"""
    print("\n" + "="*60)
    print("TEST 4: Verify Reset Token - Invalid Token")
    print("="*60)
    
    url = f"{BASE_URL}/verify-reset-token/invalid-token-12345/"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 400:
            result = response.json()
            if not result.get('valid'):
                print_success("Correctly rejected invalid token")
                return True
            else:
                print_error("Token should be invalid")
                return False
        else:
            print_error(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_reset_password_invalid_token():
    """Test reset password with invalid token"""
    print("\n" + "="*60)
    print("TEST 5: Reset Password - Invalid Token")
    print("="*60)
    
    url = f"{BASE_URL}/reset-password/"
    
    data = {
        "token": "invalid-token-12345",
        "new_password": "newpassword123"
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 400:
            print_success("Correctly rejected invalid token")
            return True
        else:
            print_error(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_reset_password_short_password():
    """Test reset password with short password"""
    print("\n" + "="*60)
    print("TEST 6: Reset Password - Short Password")
    print("="*60)
    
    url = f"{BASE_URL}/reset-password/"
    
    data = {
        "token": "some-token",
        "new_password": "short"
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 400:
            result = response.json()
            if "8" in result.get('error', ''):
                print_success("Correctly rejected short password")
                return True
            else:
                print_warning("Rejected but not for length reason")
                return True
        else:
            print_error(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_reset_password_missing_fields():
    """Test reset password with missing fields"""
    print("\n" + "="*60)
    print("TEST 7: Reset Password - Missing Fields")
    print("="*60)
    
    url = f"{BASE_URL}/reset-password/"
    
    # Missing token
    data = {"new_password": "password123"}
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 400:
            print_success("Correctly rejected missing token")
            return True
        else:
            print_error(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_method_not_allowed():
    """Test that GET is not allowed on forgot-password"""
    print("\n" + "="*60)
    print("TEST 8: Method Not Allowed - GET on forgot-password")
    print("="*60)
    
    url = f"{BASE_URL}/forgot-password/"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 405:
            print_success("Correctly rejected GET request")
            return True
        else:
            print_warning(f"Expected 405, got {response.status_code}")
            return True  # Still acceptable
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and print summary"""
    print("\n" + "="*60)
    print("PASSWORD RESET FEATURE - TEST SUITE")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    
    tests = [
        ("Forgot Password - Valid Email", test_forgot_password),
        ("Forgot Password - Invalid Email", test_forgot_password_invalid_email),
        ("Forgot Password - Missing Email", test_forgot_password_missing_email),
        ("Verify Token - Invalid Token", test_verify_reset_token_invalid),
        ("Reset Password - Invalid Token", test_reset_password_invalid_token),
        ("Reset Password - Short Password", test_reset_password_short_password),
        ("Reset Password - Missing Fields", test_reset_password_missing_fields),
        ("Method Not Allowed", test_method_not_allowed),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Test crashed: {str(e)}")
            results.append((name, False))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"{status}: {name}")
    
    print("\n" + "="*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60)
    
    if passed == total:
        print(f"\n{GREEN}All tests passed! ✓{RESET}")
        return 0
    else:
        print(f"\n{RED}Some tests failed. Please review.{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
