# Import all views from the modules
from .products import getRoutes, getProducts, getProduct, ProductSearchAPIView
from .cart import add_to_cart, remove_from_cart, ViewCart, update_cart_item_quantity
from .orders import checkout, PlaceOrderView, OrderDetailView, update_order_status
from .auth import RegisterAPIView, CustomLoginAPIView, check_email
from .user import UserProfileView
from .payments import ProcessPaymentView
from .admin import (
    verify_admin_access,
    AdminOrdersView,
    AdminOrderStatusUpdateView,
    AdminProductsView,
    AdminProductStockUpdateView,
    AdminPaymentsView,
    AdminPaymentStatusUpdateView,
    OrderPaymentStatusView
)
