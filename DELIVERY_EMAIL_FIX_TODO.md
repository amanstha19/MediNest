# Delivery Email Fix - TODO

## Root Cause
OrderAdmin in admin.py allows editing status directly, but bypasses the `update_order_status()` view function which contains the `send_delivery_email()` call.

## Plan
- [ ] 1. Add `save_model()` override in OrderAdmin class
- [ ] 2. Import `send_delivery_email` from orders module
- [ ] 3. Test the fix using test_delivery_email.py
- [ ] 4. Verify logs show delivery email activity

## Changes Required

### File: backend_easyhealth/epharm/myapp/admin.py

1. Import `send_delivery_email` at the top:
```python
from .views.orders import send_delivery_email
```

2. Add `save_model()` method to OrderAdmin class:
```python
def save_model(self, request, obj, form, change):
    # Track if status is changing to 'delivered'
    old_status = None
    if change:
        try:
            old_status = Order.objects.get(pk=obj.pk).status
        except Order.DoesNotExist:
            pass
    
    # Save the order first
    super().save_model(request, obj, form, change)
    
    # Send delivery email if status changed to 'delivered'
    if change and old_status != 'delivered' and obj.status == 'delivered':
        try:
            email_sent = send_delivery_email(obj)
            if email_sent:
                self.message_user(request, f"✓ Delivery email sent to {obj.user.email}", messages.SUCCESS)
            else:
                self.message_user(request, "⚠ Order marked delivered but email could not be sent", messages.WARNING)
        except Exception as e:
            self.message_user(request, f"⚠ Error sending delivery email: {str(e)}", messages.ERROR)
```

## Testing
Run: `python test_delivery_email.py`

