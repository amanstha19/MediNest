#!/usr/bin/env python3
"""
Simple test for delivery email functionality
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
django.setup()

from myapp.models import Order, CustomUser
from myapp.views.orders import send_delivery_email

print("=== DELIVERY EMAIL TEST ===")
print()

# Check if we have any orders
orders = Order.objects.all()
print(f"Total orders in database: {orders.count()}")

if orders.exists():
    # Get the first order
    order = orders.first()
    print(f"Testing with order ID: {order.id}")
    print(f"Order status: {order.status}")
    print(f"User: {order.user.username if order.user else 'No user'}")
    print(f"User email: {order.user.email if order.user else 'No email'}")

    # Test sending delivery email
    print()
    print("Testing send_delivery_email function...")
    try:
        result = send_delivery_email(order)
        print(f"Email send result: {result}")
        if result:
            print("✅ Delivery email sent successfully!")
        else:
            print("❌ Delivery email failed to send")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
else:
    print("No orders found. Creating a test order...")

    # Create a test user if none exists
    user = CustomUser.objects.filter(email='test@example.com').first()
    if not user:
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        print("Created test user")

    # Create a test order
    order = Order.objects.create(
        user=user,
        total_price=100.00,
        status='shipped',
        address='Test Address, Kathmandu'
    )
    print(f"Created test order ID: {order.id}")

    # Test sending delivery email
    print()
    print("Testing send_delivery_email function...")
    try:
        result = send_delivery_email(order)
        print(f"Email send result: {result}")
        if result:
            print("✅ Delivery email sent successfully!")
        else:
            print("❌ Delivery email failed to send")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

print()
print("=== TEST COMPLETE ===")
