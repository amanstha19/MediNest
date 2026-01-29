from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

from ..models import Order, CartItem

logger = logging.getLogger(__name__)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            # Get the user's profile information
            user_data = {
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }

            # Fetch the user's orders and related cart items
            orders = Order.objects.filter(user=request.user)
            orders_data = []

            for order in orders:
                cart_items = CartItem.objects.filter(order=order)
                cart_items_data = [
                    {
                        'product_id': item.product.id,
                        'product_name': item.product.name,
                        'quantity': item.quantity,
                        'price': item.product.price,
                        'total_price': item.product.price * item.quantity
                    } for item in cart_items
                ]
                order_data = {
                    'order_id': order.id,
                    'total_price': order.total_price,
                    'status': order.status,
                    'address': order.address,
                    'cart_items': cart_items_data,
                }
                orders_data.append(order_data)

            # Add orders to the response
            user_data['orders'] = orders_data

            return Response(user_data)

        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return Response({"detail": "Error fetching profile data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
