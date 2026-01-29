from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import logging

from ..models import Cart, CartItem, Product

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )

        if not created:
            cart_item.quantity += 1

        # Handle prescription file upload if required
        if product.prescription_required:
            prescription_file = request.FILES.get('prescription')
            if prescription_file:
                cart_item.prescription_file = prescription_file

        cart_item.save()

        items = cart.cart_items.all()
        cart_items = [{
            'id': item.id,
            'product_id': item.product.id,
            'name': item.product.name,
            'quantity': item.quantity,
            'price': float(item.product.price),
            'total_item_price': float(item.product.price * item.quantity),
            'image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
        } for item in items]

        total_price = float(sum(item['total_item_price'] for item in cart_items))

        return Response({
            'cart_items': cart_items,
            'total_price': total_price
        }, status=200)

    except Product.DoesNotExist:
        logger.error(f"Product with ID {product_id} not found.")
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        logger.error(f"Error adding to cart: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_cart(request, product_id):
    try:
        cart = Cart.objects.filter(user=request.user).first()

        # If cart doesn't exist, return empty response
        if not cart:
            return Response({
                'cart_items': [],
                'total_price': 0
            }, status=status.HTTP_200_OK)

        # Try to get the cart item
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()

        # If cart item doesn't exist, log it and return current cart state
        if not cart_item:
            logger.warning(
                f"Attempted to remove non-existent cart item. User: {request.user.id}, Product: {product_id}")
            items = cart.cart_items.all()
        else:
            # Delete the cart item if it exists
            cart_item.delete()
            items = cart.cart_items.all()

        # Get updated cart items
        cart_items = [{
            'id': item.id,
            'product_id': item.product.id,
            'name': item.product.name,
            'quantity': item.quantity,
            'price': float(item.product.price),
            'total_item_price': float(item.product.price * item.quantity),
            'image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
            'prescription': request.build_absolute_uri(item.prescription_file.url) if item.prescription_file else None
        } for item in items]

        total_price = float(sum(item['total_item_price'] for item in cart_items))

        return Response({
            'cart_items': cart_items,
            'total_price': total_price
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error removing item from cart: {str(e)}", exc_info=True)
        return Response({
            'error': 'An error occurred while removing the item from cart'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# View cart
class ViewCart(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            cart = get_object_or_404(Cart, user=request.user)
            items = cart.cart_items.all()

            if not items:
                return Response({'cart_items': []}, status=200)

            cart_items = [{
                'id': item.id,
                'product_id': item.product.id,
                'name': item.product.name,
                'quantity': item.quantity,
                'price': float(item.product.price),
                'total_item_price': float(item.product.price * item.quantity),
                'image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
                'prescription': request.build_absolute_uri(item.prescription_file.url) if item.prescription_file else None
            } for item in items]

            total_price = float(sum(item['total_item_price'] for item in cart_items))

            return Response({
                'cart_items': cart_items,
                'total_price': total_price
            }, status=200)

        except Exception as e:
            logger.error(f"Error viewing cart: {e}")
            return Response({'error': 'Error viewing cart'}, status=500)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_cart_item_quantity(request, product_id):
    action = request.data.get('action')

    if action not in ['increase', 'decrease']:
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)

        if action == 'increase':
            cart_item.quantity += 1
        elif action == 'decrease' and cart_item.quantity > 1:
            cart_item.quantity -= 1
        else:
            return Response({"error": "Quantity cannot be decreased further."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.save()

        # Get all cart items for response
        items = cart.cart_items.all()
        cart_items = [{
            'id': item.id,
            'product_id': item.product.id,
            'name': item.product.name,
            'quantity': item.quantity,
            'price': float(item.product.price),
            'total_item_price': float(item.product.price * item.quantity),
            'image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
        } for item in items]

        total_price = float(sum(item['total_item_price'] for item in cart_items))

        return Response({
            'cart_items': cart_items,
            'total_price': total_price
        })

    except Cart.DoesNotExist:
        return Response({"error": "Cart not found."}, status=status.HTTP_404_NOT_FOUND)
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found in cart."}, status=status.HTTP_404_NOT_FOUND)
