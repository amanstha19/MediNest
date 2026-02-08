#!/usr/bin/env python3
"""
Test script for Order Delivery Email Feature
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
django.setup()

from myapp.models import Order
from myapp.views.orders import send_delivery_email, mark_order_delivered
from django.test import RequestFactory

def test_mark_order_delivered():
    """Test the mark_order_delivered function"""
    print("=" * 60)
    print("TESTING ORDER DELIVERY EMAIL FEATURE")
    print("=" * 60)
    
    # Get existing order
    print("\n1. Finding existing order...")
    order = Order.objects.first()
    if not order:
        print("   ✗ No orders found in database")
        return False
    
    print(f"   ✓ Order found: ID {order.id}")
    print(f"   ✓ Current status: {order.status}")
    print(f"   ✓ User: {order.user.email if order.user else 'None'}")
    
    # Update status to shipped for testing
    print("\n2. Updating order status to 'shipped'...")
    order.status = 'shipped'
    order.save()
    print(f"   ✓ Status updated to: {order.status}")
    
    # Test send_delivery_email function
    print("\n3. Testing send_delivery_email function...")
    try:
        result = send_delivery_email(order)
        print(f"   ✓ send_delivery_email completed successfully")
        print(f"   ✓ Return value: {result}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Reset order status to shipped for API test
    order.status = 'shipped'
    order.save()
    
    # Test mark_order_delivered endpoint
    print("\n4. Testing mark_order_delivered API endpoint...")
    try:
        factory = RequestFactory()
        request = factory.post(f'/api/order/{order.id}/mark-delivered/')
        request.user = order.user
        
        response = mark_order_delivered(request, order.id)
        order.refresh_from_db()
        
        print(f"   ✓ API call completed")
        print(f"   ✓ Response status: {response.status_code}")
        print(f"   ✓ Order status: {order.status}")
        
        if order.status == 'delivered':
            print("   ✓ Order successfully marked as delivered!")
        else:
            print(f"   ✗ Order status NOT updated to delivered")
            return False
            
    except Exception as e:
        print(f"   ✗ API test error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
    return True

def main():
    print("\n" + "🚀" * 20)
    print("ORDER DELIVERY EMAIL TEST")
    print("🚀" * 20)
    
    test_mark_order_delivered()
    
    print("\n" + "🎉" * 20)
    print("DONE!")
    print("🎉" * 20)

if __name__ == '__main__':
    main()
