#!/usr/bin/env python3
"""
Simple script to create delivery boy user
Run this after starting the Django server
"""

import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_easyhealth', 'epharm'))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')

# Setup Django
import django
django.setup()

from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from myapp.models import Order

def create_delivery_boy():
    """Create delivery boy group and user"""
    print("Creating Delivery Boy setup...")

    # Create Delivery Boy group if it doesn't exist
    group, created = Group.objects.get_or_create(name='Delivery Boy')
    if created:
        # Add permissions to view and change orders
        order_content_type = ContentType.objects.get_for_model(Order)
        view_order_permission = Permission.objects.get(content_type=order_content_type, codename='view_order')
        change_order_permission = Permission.objects.get(content_type=order_content_type, codename='change_order')
        group.permissions.add(view_order_permission, change_order_permission)
        print("✓ Created 'Delivery Boy' group with order permissions")
    else:
        print("✓ 'Delivery Boy' group already exists")

    # Create a test delivery boy user
    username = 'delivery_boy'
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(
            username=username,
            email='delivery@medinest.com',
            password='delivery123',
            first_name='Delivery',
            last_name='Boy',
            is_staff=True
        )
        user.groups.add(group)
        print(f"✓ Created delivery boy user: {username}")
        print("✓ Password: delivery123")
        print("✓ Added to 'Delivery Boy' group")
    else:
        print("✓ Delivery boy user already exists")

    print("\n=== Login Credentials ===")
    print("Username: delivery_boy")
    print("Password: delivery123")
    print("URL: http://localhost:8000/admin/")

if __name__ == '__main__':
    create_delivery_boy()
