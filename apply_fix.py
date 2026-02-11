
#!/usr/bin/env python3
"""
Script to apply the delivery email fix to admin.py
"""

import re

# Read the original file
with open('/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm/myapp/admin.py', 'r') as f:
    content = f.read()

# 1. Add messages import
if 'from django.contrib import admin' in content:
    content = content.replace(
        'from django.contrib import admin',
        'from django.contrib import admin, messages'
    )

# 2. Add import for send_delivery_email after models import
if 'from .models import Product, CustomUser, Cart, CartItem, Order, userPayment, Category, PrescriptionVerification' in content:
    content = content.replace(
        'from .models import Product, CustomUser, Cart, CartItem, Order, userPayment, Category, PrescriptionVerification\n',
        'from .models import Product, CustomUser, Cart, CartItem, Order, userPayment, Category, PrescriptionVerification\nfrom .views.orders import send_delivery_email\n'
    )

# 3. Add save_model method to OrderAdmin class
save_model_method = '''
    def save_model(self, request, obj, form, change):
        """Override save_model to send delivery email when status changes to 'delivered'"""
        old_status = None
        if change:
            try:
                old_status = Order.objects.get(pk=obj.pk).status
            except Order.DoesNotExist:
                pass
        
        super().save_model(request, obj, form, change)
        
        if change and old_status != 'delivered' and obj.status == 'delivered':
            try:
                email_sent = send_delivery_email(obj)
                if email_sent:
                    self.message_user(request, f"Delivery email sent to {obj.user.email}", messages.SUCCESS)
                else:
                    self.message_user(request, "Order marked delivered but email could not be sent", messages.WARNING)
            except Exception as e:
                self.message_user(request, f"Error sending delivery email: {str(e)}", messages.ERROR)

'''

# Find the end of all_cartitem_detail method and add save_model after it
# Pattern: find "all_cartitem_detail.short_description = 'All Cart Items with Images'\n\n\nclass UserPaymentAdmin"
pattern = r"(    all_cartitem_detail\.short_description = 'All Cart Items with Images'\n)(\nclass UserPaymentAdmin)"
replacement = r"\1" + save_model_method + r"\2"
content = re.sub(pattern, replacement, content)

# Write the modified content
with open('/Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm/myapp/admin.py', 'w') as f:
    f.write(content)

print("✅ Fix applied successfully!")
print("\nChanges made:")
print("1. Added 'messages' import")
print("2. Added import for send_delivery_email")
print("3. Added save_model method to OrderAdmin class")

