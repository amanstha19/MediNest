from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Product, CustomUser, Cart, CartItem, Order, Category, userPayment
from rest_framework import generics


# User Serializer for creating and managing users (register)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'city', 'phone']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            city=validated_data.get('city', ''),
            phone=validated_data.get('phone', '')
        )
        return user
    

# User Serializer (for listing user data)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# User Serializer with Token (for including JWT token with user data)
class UserSerializerWithToken(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'token', 'first_name', 'last_name']

    @staticmethod
    def get_token(obj: CustomUser) -> str:
        token = RefreshToken.for_user(obj)
        return str(token.access_token)


# Custom Token Serializer (for login using email instead of username)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        user = None
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            try:
                user = CustomUser.objects.get(email=username)
            except CustomUser.DoesNotExist:
                pass
        
        if user is None:
            raise serializers.ValidationError({
                'non_field_errors': ['No account found with this username or email.']
            })
        
        if not user.check_password(password):
            raise serializers.ValidationError({
                'non_field_errors': ['Invalid password. Please try again.']
            })
        
        if not user.is_active:
            raise serializers.ValidationError({
                'non_field_errors': ['This account has been deactivated.']
            })
        
        attrs['username'] = user.username
        
        return super().validate(attrs)


# Custom User Serializer for detailed profile data
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'city', 'country', 'phone']


# Product Serializer - Returns category as string value for frontend compatibility
class ProductSerializer(serializers.ModelSerializer):
    # Return category as just the value string for frontend compatibility
    category = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'generic_name', 'price', 'image', 'prescription_required', 'category', 'description', 'stock']
    
    def get_category(self, obj):
        """Return category value code (e.g., 'OTC', 'RX') instead of object"""
        if obj.category:
            return obj.category.value
        return None


# CartItem Serializer
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = CartItem
        fields = ['product', 'quantity']


# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['id', 'items']


# Order Serializer (includes CartItem details for the order)
class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_price', 'status', 'created_at']

    def get_items(self, obj):
        cart_items = CartItem.objects.filter(order=obj)
        return CartItemSerializer(cart_items, many=True).data


class UserPaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)

    class Meta:
        model = userPayment
        fields = [
            'id',
            'amount',
            'tax_amount',
            'transaction_uuid',
            'total_amount',
            'transaction_code',
            'status',
            'order',
            'user',
            'created_at'
        ]


# Admin Payment Serializer - Detailed payment info for admin
class AdminPaymentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    user_email = serializers.CharField(source='user.email', read_only=True, allow_null=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True, allow_null=True)
    order_status = serializers.CharField(source='order.status', read_only=True, allow_null=True)
    order_total = serializers.DecimalField(
        source='order.total_price', max_digits=10, decimal_places=2, read_only=True, allow_null=True
    )

    class Meta:
        model = userPayment
        fields = [
            'id',
            'transaction_uuid',
            'transaction_code',
            'amount',
            'tax_amount',
            'total_amount',
            'status',
            'product_code',
            'user_username',
            'user_email',
            'order_id',
            'order_status',
            'order_total',
            'created_at',
            'updated_at',
        ]


# Order Payment Status Serializer - Simplified for order payment lookup
class OrderPaymentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = userPayment
        fields = [
            'id',
            'transaction_uuid',
            'transaction_code',
            'amount',
            'total_amount',
            'status',
            'created_at',
        ]


# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'value', 'label', 'icon', 'color', 'description', 'order', 'is_active']
