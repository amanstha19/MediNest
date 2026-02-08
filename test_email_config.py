#!/usr/bin/env python3
"""
Test script to verify email configuration is working
Run this to check if Django can send emails with your Gmail credentials
"""

import os
import sys

# Add the backend path
sys.path.insert(0, '/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm')
os.chdir('/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm')

# Load Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')

import django
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=" * 60)
print("EMAIL CONFIGURATION TEST")
print("=" * 60)

# Check settings
print("\n📧 Email Settings:")
print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"  EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
print(f"  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

# Check if credentials are set
if not settings.EMAIL_HOST_USER:
    print("\n❌ ERROR: EMAIL_HOST_USER is not set!")
    print("   Make sure your .env file has EMAIL_HOST_USER=your-email@gmail.com")
    sys.exit(1)

if not settings.EMAIL_HOST_PASSWORD:
    print("\n❌ ERROR: EMAIL_HOST_PASSWORD is not set!")
    print("   Make sure your .env file has EMAIL_HOST_PASSWORD=your-app-password")
    sys.exit(1)

print("\n✅ Email credentials are configured")

# Test sending email
test_email = input(f"\nEnter test email address (default: {settings.EMAIL_HOST_USER}): ").strip()
if not test_email:
    test_email = settings.EMAIL_HOST_USER

print(f"\n📤 Sending test email to: {test_email}")
print("   Please wait...")

try:
    send_mail(
        subject='MEDINEST - Test Email',
        message='''This is a test email from MEDINEST.

If you received this, your email configuration is working correctly!

Best regards,
MEDINEST Team''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[test_email],
        fail_silently=False,
    )
    print("\n✅ SUCCESS! Test email sent successfully!")
    print(f"   Check your inbox at: {test_email}")
    print("   (Also check spam folder)")
    
except Exception as e:
    print(f"\n❌ FAILED to send email!")
    print(f"   Error: {str(e)}")
    print("\n🔧 Troubleshooting:")
    print("   1. Check if 2FA is enabled on your Gmail account")
    print("   2. Verify you're using an App Password (not your regular password)")
    print("   3. Check if 'Less secure app access' is enabled (if not using 2FA)")
    print("   4. Try generating a new App Password at https://myaccount.google.com/apppasswords")
    sys.exit(1)

print("\n" + "=" * 60)
print("Email configuration is working! 🎉")
print("=" * 60)
