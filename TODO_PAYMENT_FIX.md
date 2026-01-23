# Payment Status Fix Implementation Plan

## Backend (Django) Changes

- [x] Update models.py: Extend userPayment.status choices (PENDING, PAID, FAILED, REFUNDED)
- [x] Update models.py: Add proper FK from userPayment to Order (already exists)
- [x] Update models.py: Add 'processing', 'paid' to Order.STATUS_CHOICES
- [x] Create database migration for model changes (0035_payment_fix.py)
- [x] Update serializers.py: Add AdminPaymentSerializer, AdminPaymentListSerializer
- [x] Update views.py: Add AdminPaymentsView (GET /api/admin/payments/)
- [x] Update views.py: Add AdminPaymentStatusUpdateView (PATCH /api/admin/payments/{id}/status/)
- [x] Update views.py: Add OrderPaymentStatusView (GET /api/orders/{order_id}/payment-status/)
- [x] Update views.py: Enhance ProcessPaymentView to update order status on payment success
- [x] Update urls.py: Add new admin payment endpoints
- [x] Update admin.py: Enhance UserPaymentAdmin with better display

## Frontend (React) Changes

- [x] Update AdminPanel.jsx: Add Payments tab
- [x] Update AdminPanel.jsx: Show payment status in Orders table
- [x] Update AdminPanel.jsx: Allow admin to update payment status via dropdown
- [x] Update AdminPanel.jsx: Display order info inside payments list

## Testing

- [ ] Test payment callback updates order status
- [ ] Test admin payment management APIs
- [ ] Test frontend admin panel payments tab
- [ ] Verify database relationships work correctly

## Next Steps

1. Run migrations: `python3 manage.py migrate`
2. Test the new API endpoints
3. Verify the admin panel works correctly
4. Test payment flow end-to-end
