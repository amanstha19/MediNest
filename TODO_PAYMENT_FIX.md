# TODO: Fix Cash Payment Display Issue

## Issue

When users select Cash on Delivery, the system shows "online payment" instead of the correct payment method.

## Root Cause

- Order model lacks `payment_method` field
- COD orders don't create userPayment records
- Payment method not saved or displayed properly

## Tasks

### 1. Add payment_method field to Order model ✅

- [x] Add PAYMENT_METHOD_CHOICES to Order model
- [x] Add payment_method CharField with choices
- [x] Create migration file (0041_order_payment_method.py)

### 2. Update PlaceOrderView (orders.py) ✅

- [x] Save payment_method to Order model
- [x] Create userPayment record for COD orders with "CASH_ON_DELIVERY"

### 3. Update OrderSerializer (serializers.py) ✅

- [x] Add payment_method field to OrderSerializer
- [x] Add payment_method_display for human-readable format

### 4. Update OrderSuccessScreen.jsx (frontend) ✅

- [x] Display payment method on success screen

### 5. Test the fix ✅

- [x] Migration applied successfully (0041_order_payment_method)
