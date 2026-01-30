from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import hmac
import hashlib
import base64
import logging

from ..models import userPayment, Order

logger = logging.getLogger(__name__)


class ProcessPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if 'data' in request.data or 'status' in request.data:
                transaction_uuid = request.data.get('transaction_uuid')
                status_code = request.data.get('status', 'SUCCESS')  # Default to SUCCESS if data present
                transaction_code = request.data.get('transaction_code')

                try:
                    payment = userPayment.objects.get(transaction_uuid=transaction_uuid)
                    payment.transaction_code = transaction_code
                    payment.status = status_code
                    payment.save()

                    # Update order status if payment is successful
                    if payment.status in ['PAID', 'SUCCESS'] and payment.order:
                        payment.order.status = 'paid'
                        payment.order.save()
                        logger.info(f"Order {payment.order.id} status updated to paid")
    
                    logger.info(f"Payment callback processed successfully for transaction {transaction_uuid}")
                    return Response({
                        "message": "Payment successful",
                        "transaction_uuid": transaction_uuid,
                        "order_id": payment.order.id if payment.order else None
                    }, status=status.HTTP_200_OK)
    
                except userPayment.DoesNotExist:
                    logger.error(f"Payment not found for transaction {transaction_uuid}")
                    return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

            amount = float(request.data.get('amount', 0))
            tax_amount = float(request.data.get('tax_amount', 0))
            transaction_uuid = request.data.get('transaction_uuid')
            order_id = request.data.get('order_id')

            if not transaction_uuid:
                return Response({"error": "Missing transaction_uuid"}, status=status.HTTP_400_BAD_REQUEST)

            if not order_id:
                return Response({"error": "Missing order_id"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                order = Order.objects.get(id=order_id, user=request.user)
            except Order.DoesNotExist:
                return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

            total_amount = amount + tax_amount

            payment = userPayment.objects.create(
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                transaction_uuid=transaction_uuid,
                status="PENDING",
                payment_method="ONLINE",
                user=request.user if request.user.is_authenticated else None,
                order=order,
            )

            # For online orders, set status to paid immediately
            if order:
                order.status = 'paid'
                payment.status = 'PAID'  # Auto-set payment status to PAID for online payments
                payment.save()
                order.save()
                logger.info(f"Order {order.id} status set to paid for online payment")
            
            message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code=EPAYTEST"
            secret_key = "8gBm/:&EnhH.1/q"
            signature = base64.b64encode(
                hmac.new(
                    secret_key.encode(),
                    message.encode(),
                    hashlib.sha256
                ).digest()
            ).decode()

            user_payment_data = {
                "amount": str(amount),
                "tax_amount": str(tax_amount),
                "total_amount": str(total_amount),
                "transaction_uuid": transaction_uuid,
                "product_code": "EPAYTEST",
                "product_service_charge": "0",
                "product_delivery_charge": "0",
                "success_url": f"http://localhost:5173/#/order-success/{order_id}",
                "failure_url": f"http://localhost:5173/#/payment-failure",
                "signed_field_names": "total_amount,transaction_uuid,product_code",
                "signature": signature
            }

            return Response(user_payment_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Payment processing error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

