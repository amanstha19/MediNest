from datetime import timezone
from django.utils import timezone

from django.db import models
from django.contrib.auth.models import AbstractUser
from rest_framework.exceptions import ValidationError
from django.conf import settings


# Custom User model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = 'Custom User'
        verbose_name_plural = 'Custom Users'

    def __str__(self):
        return self.username


# Category Model - For managing product categories in backend
class Category(models.Model):
    value = models.CharField(max_length=50, unique=True)  # e.g., 'OTC', 'RX', 'SUP'
    label = models.CharField(max_length=100)  # e.g., '💊 Over-the-Counter'
    icon = models.CharField(max_length=50, blank=True, null=True)  # Emoji icon
    color = models.CharField(max_length=200, default='linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'label']

    def __str__(self):
        return self.label


# Product model - Uses ForeignKey to Category (real-world pattern)
class Product(models.Model):
    id = models.AutoField(primary_key=True)
    generic_name = models.CharField(max_length=200, null=True, blank=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.IntegerField(default=0)
    prescription_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.generic_name if self.generic_name else self.name if self.name else "Unnamed Product"
    
    @property
    def category_value(self):
        """Return the category value code for backward compatibility"""
        if self.category:
            return self.category.value
        return None
    
    @property
    def category_label(self):
        """Return the category label for display"""
        if self.category:
            return self.category.label
        return None


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('canceled', 'Canceled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('ONLINE', 'Online Payment'),
        ('CASH_ON_DELIVERY', 'Cash on Delivery'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    address = models.TextField(null=False, default="Unknown Address")
    prescription = models.FileField(upload_to='prescriptions/', null=True, blank=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='CASH_ON_DELIVERY')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        cart_items = self.cartitem_set.all()
        cart_items_str = ", ".join([f"{item.quantity} x {item.product.name}" for item in cart_items])
        return (f"Order {self.id} - {self.user.first_name} {self.user.last_name} ({self.user.phone}) "
                f"Status: {self.status} - Address: {self.address} - Cart Items: {cart_items_str}")


class Cart(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='cart')

    def __str__(self):
        return f"Cart of {self.user.username}"


class CartItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    prescription_file = models.FileField(upload_to='cart_prescriptions/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class userPayment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('ONLINE', 'Online Payment'),
        ('CASH_ON_DELIVERY', 'Cash on Delivery'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_payments', null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    products = models.ManyToManyField(Product, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_uuid = models.CharField(max_length=100, unique=True)
    transaction_code = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='ONLINE')
    product_code = models.CharField(max_length=50, default='EPAYTEST')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.transaction_uuid} - {self.status}"

    def get_order_details(self):
        if self.order:
            return f"Order ID: {self.order.id}, Status: {self.order.status}, Address: {self.order.address}, Total: {self.order.total_price}"
        return "No order details available"


# Password Reset Token Model
class PasswordResetToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
    
    def __str__(self):
        return f"Password Reset Token for {self.user.email}"
    
    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()


# Prescription Verification Model
class PrescriptionVerification(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='verification')
    
    # OCR extracted fields
    prescription_image = models.ImageField(upload_to='prescription_verifications/', null=True, blank=True)
    extracted_nmc_number = models.CharField(max_length=50, blank=True, null=True)
    doctor_name = models.CharField(max_length=100, blank=True, null=True)
    hospital_name = models.CharField(max_length=200, blank=True, null=True)  # Hospital/Clinic name
    department = models.CharField(max_length=100, blank=True, null=True)  # Department (e.g., Cardiology)
    
    # Enhanced OCR fields
    medicine_list = models.JSONField(default=list, blank=True, null=True)  # List of prescribed medicines
    patient_name = models.CharField(max_length=100, blank=True, null=True)  # Patient name
    patient_age = models.CharField(max_length=20, blank=True, null=True)  # Patient age
    patient_gender = models.CharField(max_length=20, blank=True, null=True)  # Patient gender
    chief_complaints = models.TextField(blank=True, null=True)  # Chief complaints
    followup_date = models.CharField(max_length=50, blank=True, null=True)  # Follow-up date
    
    # OCR metadata
    ocr_confidence = models.CharField(max_length=20, default='low')  # high, medium, low
    ocr_raw_text = models.TextField(blank=True, null=True)
    
    # Verification status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    verified_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_prescriptions')
    verification_notes = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Prescription Verification for Order #{self.order.id} - {self.status}"
    
    def get_status_badge(self):
        colors = {
            'pending': '#ffc107',
            'approved': '#28a745',
            'rejected': '#dc3545',
        }
        return colors.get(self.status, '#6c757d')
