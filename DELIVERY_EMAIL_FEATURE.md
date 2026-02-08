# Order Delivery Email Feature

## Overview
The delivery email feature automatically sends an email notification to customers when their order is marked as delivered.

## How It Works

### 1. Trigger Points
The delivery email is sent in two scenarios:

**A. Via Admin Order Status Update (PATCH /api/order/{id}/status/)**
```python
# When admin updates order status to 'delivered'
if new_status == 'delivered':
    send_delivery_email(order)
```

**B. Via Mark Delivered Endpoint (POST /api/order/{id}/mark-delivered/)**
```python
# Direct endpoint to mark order as delivered
order.status = 'delivered'
order.save()
email_sent = send_delivery_email(order)
```

### 2. Email Content
The email includes:
- 📦 Delivery confirmation subject
- Order ID and delivery address
- List of delivered items with quantities and prices
- Total amount
- Customer support information
- Professional formatting with clear sections

### 3. Email Function Location
**File**: `backend_easyhealth/epharm/myapp/views/orders.py`

**Function**: `send_delivery_email(order)`
- Sends email to `order.user.email`
- Includes all order items from `CartItem.objects.filter(order=order)`
- Uses Django's `send_mail()` function
- Logs success/failure for debugging

## API Endpoints

### 1. Update Order Status (Admin Use)
```
PATCH /api/order/{order_id}/status/
Content-Type: application/json

Body:
{
    "status": "delivered"
}

Response:
{
    "message": "Order status updated successfully.",
    "order_id": 1
}
```

### 2. Mark Order Delivered (Authenticated Users)
```
POST /api/order/{order_id}/mark-delivered/
Authorization: Bearer {token}

Response:
{
    "message": "Order marked as delivered and customer notified via email.",
    "order_id": 1,
    "email_sent": true
}
```

## Testing the Feature

### Method 1: Using Admin Panel
1. Login to Django admin at `http://localhost:8000/admin/`
2. Navigate to Orders
3. Select an order and change status to "delivered"
4. Save - email will be sent automatically

### Method 2: Using API (with authentication)
```bash
# Get auth token first
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# Mark order as delivered
curl -X POST http://localhost:8000/api/order/1/mark-delivered/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Method 3: Using Admin API (PATCH status)
```bash
curl -X PATCH http://localhost:8000/api/order/1/status/ \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

## Email Configuration
The feature uses Django's email settings from `settings.py`:
- `DEFAULT_FROM_EMAIL` or `EMAIL_HOST_USER` as sender
- Requires proper SMTP configuration (Gmail, SendGrid, etc.)

## Logs to Check
Watch the backend logs for delivery email activity:
```bash
docker logs medinest-backend-1 -f | grep -i "delivery\|delivered\|email"
```

Expected log output:
```
Delivery email sent successfully for order {id} to {email}
```

## Troubleshooting

### Email Not Sending?
1. Check email settings in `backend_easyhealth/epharm/epharm/settings.py`
2. Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
3. Check backend logs for errors
4. Ensure order has a valid user with email address

### Common Issues
- **401 Unauthorized**: User not authenticated (need valid JWT token)
- **Order not found**: Order ID doesn't exist
- **No email sent**: User has no email address in profile

## Files Involved
- ✅ `backend_easyhealth/epharm/myapp/views/orders.py` - `send_delivery_email()` function
- ✅ `backend_easyhealth/epharm/myapp/urls.py` - URL routes
- ✅ `backend_easyhealth/epharm/epharm/settings.py` - Email configuration

## Status
🎉 **DELIVERY EMAIL FEATURE IS FULLY IMPLEMENTED AND READY TO USE!**

The feature automatically sends a professional delivery confirmation email whenever an order status is changed to "delivered" via the admin panel or API endpoints.
