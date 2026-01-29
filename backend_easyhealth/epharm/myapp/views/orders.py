from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db import transaction
import json
import logging

from ..models import Cart, CartItem, Order, Product
from ..serializers import OrderSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkout(request):
    try:
        cart = get_object_or_404(Cart, user=request.user)

        if cart.cart_items.count() == 0:
            return Response({'message': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        total_price = sum([item.product.price * item.quantity for item in cart.cart_items.all()])
        order = Order.objects.create(user=request.user, total_price=total_price, status="pending", address=request.data.get('address'))

        for cart_item in cart.cart_items.all():
            cart_item.order = order
            cart_item.save()

        # Clear the cart after creating the order
        cart.cart_items.all().delete()

        return Response({'message': 'Checkout complete, your cart is now empty.', 'order_id': order.id}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error during checkout: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            cart_items_data = request.data.get('cart_items')
            address = request.data.get('address')
            prescription = request.data.get('prescription', None)
            payment_method = request.data.get('payment_method')

            if not cart_items_data or not address:
                return Response({"detail": "Missing cart items or address."}, status=status.HTTP_400_BAD_REQUEST)

            cart_items = json.loads(cart_items_data)
            total_price = 0

            with transaction.atomic():
                # Create the order first
                order = Order.objects.create(user=request.user, total_price=0, address=address)

                for item in cart_items:
                    product = get_object_or_404(Product, id=item['id'])

                    # Check stock availability
                    if product.stock < item['quantity']:
                        return Response({"detail": f"Not enough stock for {product.name}."},
                                        status=status.HTTP_400_BAD_REQUEST)

                    total_price += product.price * item['quantity']

                    # Reduce stock **before** payment
                    product.stock -= item['quantity']
                    product.save()

                    # Link cart items to the order
                    CartItem.objects.create(
                        product=product,
                        quantity=item['quantity'],
                        order=order
                    )

                # Save the final total price
                order.total_price = total_price
                order.save()

                # Handle prescription upload
                if prescription:
                    prescription_file = request.FILES.get('prescription')
                    if prescription_file:
                        order.prescription = prescription_file
                        order.save()

                # Check payment method
                if payment_method == "online":
                    return Response({
                        "order_id": order.id,
                        "message": "Proceed to eSewa payment",
                        "total_price": total_price
                    }, status=status.HTTP_200_OK)

                return Response({"order_id": order.id}, status=status.HTTP_201_CREATED)

        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error placing order: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"message": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    status = request.data.get('status')

    if status not in ['pending', 'shipped', 'delivered']:  # Example statuses
        return Response({"message": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

    order.status = status
    order.save()

    return Response({"message": "Order status updated successfully.", "order_id": order.id}, status=status.HTTP_200_OK)
