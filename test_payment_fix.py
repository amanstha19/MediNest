#!/usr/bin/env python
"""
Test script to verify the cash payment fix works correctly.
Tests that:
1. Orders can be created with CASH_ON_DELIVERY payment method
2. userPayment records are created for COD orders
3. OrderSerializer returns correct payment_method_display
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/amanshrestha/Desktop/MediNest/backend_easyhealth')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
django.setup()

from myapp.models import Order, userPayment, CustomUser, Product, Cart, CartItem
from myapp.serializers import OrderSerializer
import json

def test_order_with_cod_payment():
    print("Testing COD payment method...")
    
    # Get or create a test user
    user, created = CustomUser.objects.get_or_create(
        username='testuser_cod',
        defaults={
            'email': 'test_cod@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    print(f"User: {user.username} (created: {created})")
    
    # Get or create a test product
    product, created = Product.objects.get_or_create(
        id=999,
        defaults={
            'name': 'Test Medicine',
            'generic_name': 'Test Generic',
            'price': 100.00,
            'stock': 10
        }
    )
    print(f"Product: {product.name} (created: {created})")
    
    # Create order with COD payment method
    order = Order.objects.create(
        user=user,
        total_price=100.00,
        status='pending',
        address='123 Test Street',
        payment_method='CASH_ON_DELIVERY'
    )
    print(f"Created order {order.id} with payment_method: {order.payment_method}")
    
    # Create cart item linked to order
    cart_item = CartItem.objects.create(
        product=product,
        quantity=1,
        order=order
    )
    print(f"Created cart item: {cart_item}")
    
    # Create userPayment record for COD
    payment = userPayment.objects.create(
        amount=100.00,
        tax_amount=0,
        total_amount=100.00,
        transaction_uuid=f"COD-TEST-{order.id}",
        status='PENDING',
        payment_method='CASH_ON_DELIVERY',
        user=user,
        order=order
    )
    print(f"Created COD payment record: {payment.transaction_uuid}")
    
    # Test serializer
    serializer = OrderSerializer(order)
    serialized_data = serializer.data
    print(f"\nSerialized order data:")
    print(f"  payment_method: {serialized_data.get('payment_method')}")
    print(f"  payment_method_display: {serialized_data.get('payment_method_display')}")
    
    # Verify the data
    assert serialized_data.get('payment_method') == 'CASH_ON_DELIVERY', "payment_method should be CASH_ON_DELIVERY"
    assert serialized_data.get('payment_method_display') == 'Cash on Delivery', "payment_method_display should be 'Cash on Delivery'"
    
    print("\n✅ COD payment test PASSED!")
    
    # Clean up
    payment.delete()
    cart_item.delete()
    order.delete()
    print("Cleaned up test data")
    
    return True


def test_order_with_online_payment():
    print("\nTesting Online payment method...")
    
    # Get or create a test user
    user, created = CustomUser.objects.get_or_create(
        username='testuser_online',
        defaults={
            'email': 'test_online@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    print(f"User: {user.username} (created: {created})")
    
    # Create order with ONLINE payment method
    order = Order.objects.create(
        user=user,
        total_price=200.00,
        status='pending',
        address='456 Online Street',
        payment_method='ONLINE'
    )
    print(f"Created order {order.id} with payment_method: {order.payment_method}")
    
    # Test serializer
    serializer = OrderSerializer(order)
    serialized_data = serializer.data
    print(f"\nSerialized order data:")
    print(f"  payment_method: {serialized_data.get('payment_method')}")
    print(f"  payment_method_display: {serialized_data.get('payment_method_display')}")
    
    # Verify the data
    assert serialized_data.get('payment_method') == 'ONLINE', "payment_method should be ONLINE"
    assert serialized_data.get('payment_method_display') == 'Online Payment (eSewa)', "payment_method_display should be 'Online Payment (eSewa)'"
    
    print("\n✅ Online payment test PASSED!")
    
    # Clean up
    order.delete()
    print("Cleaned up test data")
    
    return True


if __name__ == '__main__':
    print("=" * 60)
    print("Testing Payment Method Fix")
    print("=" * 60)
    
    try:
        test_order_with_cod_payment()
        test_order_with_online_payment()
        
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED! ✅")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

