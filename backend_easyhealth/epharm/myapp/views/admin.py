from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
import logging

from ..models import Order, CartItem, Product, userPayment
from ..serializers import AdminPaymentSerializer

logger = logging.getLogger(__name__)


# Admin Verification Endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_admin_access(request):
    """
    Verify if the authenticated user has admin access
    Returns user info if they are admin, 403 if not
    """
    user = request.user

    if user.is_staff or user.is_superuser:
        return Response({
            'is_admin': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'is_admin': False,
            'error': 'User is not an admin'
        }, status=status.HTTP_403_FORBIDDEN)


# Admin: Get All Orders
class AdminOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        orders = Order.objects.all().order_by('-created_at')
        orders_data = []

        for order in orders:
            cart_items = CartItem.objects.filter(order=order)
            cart_items_data = [
                {
                    'product_id': item.product.id,
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': float(item.product.price),
                    'total_price': float(item.product.price * item.quantity)
                } for item in cart_items
            ]

            order_data = {
                'id': order.id,
                'user_id': order.user.id,
                'username': order.user.username,
                'email': order.user.email,
                'first_name': order.user.first_name,
                'last_name': order.user.last_name,
                'phone': order.user.phone,
                'total_price': float(order.total_price),
                'status': order.status,
                'address': order.address,
                'cart_items': cart_items_data,
                'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': order.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            }
            orders_data.append(order_data)

        return Response({'orders': orders_data}, status=status.HTTP_200_OK)


# Admin: Update Order Status
class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')

        if new_status not in ['pending', 'shipped', 'delivered']:
            return Response({'error': 'Invalid status. Use: pending, shipped, or delivered'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        order.status = new_status
        order.save()

        return Response({
            'message': 'Order status updated successfully',
            'order_id': order.id,
            'old_status': old_status,
            'new_status': new_status
        }, status=status.HTTP_200_OK)


# Admin: Get All Products with Stock Management
class AdminProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        products = Product.objects.all().order_by('name')
        products_data = []

        for product in products:
            product_data = {
                'id': product.id,
                'name': product.name,
                'generic_name': product.generic_name,
                'category': product.category,
                'price': float(product.price),
                'stock': product.stock,
                'prescription_required': product.prescription_required,
                'image': product.image.url if product.image else None,
            }
            products_data.append(product_data)

        return Response({'products': products_data}, status=status.HTTP_200_OK)


# Admin: Update Product Stock
class AdminProductStockUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, product_id):
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        new_stock = request.data.get('stock')

        if new_stock is None:
            return Response({'error': 'Stock value is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product.stock = int(new_stock)
            product.save()
        except ValueError:
            return Response({'error': 'Stock must be a number'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Stock updated successfully',
            'product_id': product.id,
            'product_name': product.name,
            'new_stock': product.stock
        }, status=status.HTTP_200_OK)


# Admin: Get All Payments
class AdminPaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        payments = userPayment.objects.all().order_by('-created_at')
        serializer = AdminPaymentSerializer(payments, many=True)

        return Response({
            'payments': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)


# Admin: Update Payment Status
class AdminPaymentStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, payment_id):
        # Check if user is admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            payment = userPayment.objects.get(id=payment_id)
        except userPayment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')

        # Validate status
        valid_statuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Use: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        old_status = payment.status
        payment.status = new_status
        payment.save()

        # If payment is marked as PAID, update related order status
        if new_status == 'PAID' and payment.order:
            payment.order.status = 'paid'
            payment.order.save()
            logger.info(f"Order {payment.order.id} status updated to 'paid' after payment confirmation")

        return Response({
            'message': 'Payment status updated successfully',
            'payment_id': payment.id,
            'transaction_uuid': payment.transaction_uuid,
            'old_status': old_status,
            'new_status': new_status
        }, status=status.HTTP_200_OK)


# Get Order Payment Status
class OrderPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user owns this order or is admin
        if order.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        try:
            payment = userPayment.objects.filter(order=order).first()
            if payment:
                serializer = OrderPaymentStatusSerializer(payment)
                return Response({
                    'order_id': order.id,
                    'order_status': order.status,
                    'payment': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'order_id': order.id,
                    'order_status': order.status,
                    'payment': None,
                    'message': 'No payment found for this order'
                }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching payment status: {str(e)}")
            return Response({'error': 'Error fetching payment status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
