from django.urls import path
from . import views
from .views import (
    CustomLoginAPIView,
    UserProfileView,
    PlaceOrderView,
    update_cart_item_quantity,
    update_order_status,
    mark_order_delivered,
    OrderDetailView,
    ViewCart,
    RegisterAPIView, 
    ProductSearchAPIView,
    verify_admin_access,
    ProcessPaymentView,
    AdminOrdersView,
    AdminOrderStatusUpdateView,
    AdminProductsView,
    AdminProductStockUpdateView,
    AdminPaymentsView,
    AdminPaymentStatusUpdateView,
    OrderPaymentStatusView,
    forgot_password,
    verify_reset_token,
    reset_password,
)
from .views.chatbot import HealthChatbotAPIView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

app_name = 'myapp'

urlpatterns = [
    # Base Routes
    path('', views.getRoutes, name='getRoutes'),

    # Authentication & User Routes
    path('login/', CustomLoginAPIView.as_view(), name='login'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('check-email/', views.check_email, name='check_email'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('verify-admin/', verify_admin_access, name='verify-admin'),
    
    # Password Reset Routes
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('verify-reset-token/<str:token>/', verify_reset_token, name='verify-reset-token'),
    path('reset-password/', reset_password, name='reset-password'),

# Product Routes
    path('products/', views.getProducts, name='products'),
    path('product/<int:pk>/', views.getProduct, name='product-detail'),
    path('categories/', views.getCategories, name='categories'),

    # Cart Routes
    path('cart/', ViewCart.as_view(), name='cart'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add-to-cart'),
    path('cart/remove/<int:product_id>/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/update-item/<int:product_id>/', update_cart_item_quantity, name='update-cart-item'),
    path('cart/checkout/', views.checkout, name='checkout'),

    # Order Routes
    path('order/place/', PlaceOrderView.as_view(), name='order-place'),
    path('order/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('order/<int:order_id>/status/', update_order_status, name='order-status-update'),
    path('order/<int:order_id>/mark-delivered/', mark_order_delivered, name='order-mark-delivered'),

    # Search Routes
    path('products/search/', ProductSearchAPIView.as_view(), name='product-search'),
    
    # Payment Routes
    path('payment/process/', ProcessPaymentView.as_view(), name='payment-process'),

    # Admin Routes
    path('admin/orders/', AdminOrdersView.as_view(), name='admin-orders'),
    path('admin/orders/<int:order_id>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status'),
    path('admin/products/', AdminProductsView.as_view(), name='admin-products'),
    path('admin/products/<int:product_id>/stock/', AdminProductStockUpdateView.as_view(), name='admin-product-stock'),
    
    # Admin Payment Routes
    path('admin/payments/', AdminPaymentsView.as_view(), name='admin-payments'),
    path('admin/payments/<int:payment_id>/status/', AdminPaymentStatusUpdateView.as_view(), name='admin-payment-status'),
    
    # Order Payment Status
    path('orders/<int:order_id>/payment-status/', OrderPaymentStatusView.as_view(), name='order-payment-status'),
    
    # Chatbot Routes
    path('chatbot/', HealthChatbotAPIView.as_view(), name='chatbot'),
]
