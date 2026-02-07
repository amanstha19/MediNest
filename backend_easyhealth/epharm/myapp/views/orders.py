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
import os
import tempfile
import uuid
from pathlib import Path

from ..models import Cart, CartItem, Order, Product, PrescriptionVerification, userPayment
from ..serializers import OrderSerializer
from ..advanced_ocr_handwriting import enhanced_analyze_prescription as analyze_prescription

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
            payment_method = request.data.get('payment_method')

            if not cart_items_data or not address:
                return Response({"detail": "Missing cart items or address."}, status=status.HTTP_400_BAD_REQUEST)

            cart_items = json.loads(cart_items_data)
            total_price = 0

            # Map frontend payment method to backend format
            backend_payment_method = 'ONLINE' if payment_method == 'online' else 'CASH_ON_DELIVERY'

            with transaction.atomic():
                # Create the order first
                order = Order.objects.create(user=request.user, total_price=0, address=address, payment_method=backend_payment_method)

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

                # Handle prescription upload with automatic OCR
                prescription_file = request.FILES.get('prescription')
                if prescription_file:
                    # Save prescription to order
                    order.prescription = prescription_file
                    order.save()

                    # Check if file is supported for OCR
                    file_name = prescription_file.name.lower()
                    supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.pdf']
                    is_supported = any(file_name.endswith(ext) for ext in supported_formats)

                    if not is_supported:
                        # For unsupported formats (like HEIC), create record without OCR
                        PrescriptionVerification.objects.create(
                            order=order,
                            prescription_image=prescription_file,
                            status='pending',
                            verification_notes=f"Prescription uploaded ({prescription_file.name}). Manual verification required - unsupported file format for OCR."
                        )
                        logger.info(f"Prescription uploaded for order {order.id} - unsupported format: {prescription_file.name}")
                    else:
                        # Extract OCR data from the prescription
                        try:
                            # Create a temporary file to save the uploaded content
                            file_extension = Path(file_name).suffix or '.pdf'
                            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                                for chunk in prescription_file.chunks():
                                    temp_file.write(chunk)
                                temp_file_path = temp_file.name

                            try:
                                # Run OCR analysis on the temporary file
                                ocr_result = analyze_prescription(temp_file_path)

                                # Create PrescriptionVerification record with enhanced OCR data
                                patient_info = ocr_result.get('patient_info', {})
                                verification_notes = (
                                    f"OCR extracted: NMC={ocr_result.get('nmc_number')}, "
                                    f"Doctor={ocr_result.get('doctor_name')}, "
                                    f"Hospital={ocr_result.get('hospital_name')}, "
                                    f"Dept={ocr_result.get('department')}, "
                                    f"Medicines={len(ocr_result.get('medicines', []))}, "
                                    f"Confidence={ocr_result.get('confidence')}"
                                )
                                
                                PrescriptionVerification.objects.create(
                                    order=order,
                                    prescription_image=prescription_file,
                                    extracted_nmc_number=ocr_result.get('nmc_number'),
                                    doctor_name=ocr_result.get('doctor_name'),
                                    hospital_name=ocr_result.get('hospital_name'),
                                    department=ocr_result.get('department'),
                                    medicine_list=ocr_result.get('medicines', []),
                                    patient_name=patient_info.get('name'),
                                    patient_age=patient_info.get('age'),
                                    patient_gender=patient_info.get('gender'),
                                    chief_complaints=ocr_result.get('complaints'),
                                    followup_date=ocr_result.get('followup_date'),
                                    status='pending',
                                    ocr_confidence=ocr_result.get('confidence', 'low'),
                                    ocr_raw_text=ocr_result.get('raw_text', '')[:2000] if ocr_result.get('raw_text') else '',
                                    verification_notes=verification_notes
                                )

                                logger.info(f"OCR completed for order {order.id}: NMC={ocr_result.get('nmc_number')}, Doctor={ocr_result.get('doctor_name')}, Hospital={ocr_result.get('hospital_name')}, Dept={ocr_result.get('department')}, Medicines={len(ocr_result.get('medicines', []))}, Confidence={ocr_result.get('confidence')}")

                            finally:
                                # Clean up temporary file
                                if os.path.exists(temp_file_path):
                                    os.unlink(temp_file_path)

                        except Exception as ocr_error:
                            logger.error(f"OCR processing failed for order {order.id}: {str(ocr_error)}")
                            # Still save prescription even if OCR fails
                            PrescriptionVerification.objects.create(
                                order=order,
                                prescription_image=prescription_file,
                                status='pending',
                                verification_notes=f"Prescription uploaded but OCR processing failed: {str(ocr_error)}"
                            )

                # Create payment record for COD orders
                if backend_payment_method == 'CASH_ON_DELIVERY':
                    transaction_uuid = f"COD-{uuid.uuid4().hex[:12].upper()}"
                    userPayment.objects.create(
                        amount=total_price,
                        tax_amount=0,
                        total_amount=total_price,
                        transaction_uuid=transaction_uuid,
                        status='PENDING',
                        payment_method='CASH_ON_DELIVERY',
                        user=request.user if request.user.is_authenticated else None,
                        order=order,
                    )
                    logger.info(f"COD payment record created for order {order.id}: {transaction_uuid}")

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

