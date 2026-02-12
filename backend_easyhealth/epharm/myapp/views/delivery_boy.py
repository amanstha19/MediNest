from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import Group
from ..models import Order, userPayment
from ..serializers import OrderSerializer


class DeliveryBoyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is in Delivery Boy group
        if not request.user.groups.filter(name='Delivery Boy').exists():
            return Response(
                {'error': 'Access denied. Delivery Boy access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get orders that are shipped or processing (for delivery boys)
        orders = Order.objects.filter(
            status__in=['processing', 'shipped']
        ).select_related('user').prefetch_related('cartitem_set')

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class DeliveryBoyDeliverOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        # Check if user is in Delivery Boy group
        if not request.user.groups.filter(name='Delivery Boy').exists():
            return Response(
                {'error': 'Access denied. Delivery Boy access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only allow delivery of shipped orders
        if order.status != 'shipped':
            return Response(
                {'error': 'Order must be shipped before delivery'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'delivered'
        order.save()

        return Response({'message': 'Order marked as delivered'})


class DeliveryBoyCancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        # Check if user is in Delivery Boy group
        if not request.user.groups.filter(name='Delivery Boy').exists():
            return Response(
                {'error': 'Access denied. Delivery Boy access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only allow cancellation of processing or shipped orders
        if order.status not in ['processing', 'shipped']:
            return Response(
                {'error': 'Order cannot be cancelled at this stage'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'canceled'
        order.save()

        return Response({'message': 'Order cancelled successfully'})
