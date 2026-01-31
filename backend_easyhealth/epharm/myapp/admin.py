from django.contrib import admin
from django.contrib.admin import AdminSite
from django.template.response import TemplateResponse
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.utils import timezone
from django.urls import path
from django.shortcuts import render
from datetime import timedelta
from unfold.sites import UnfoldAdminSite
from .models import Product, CustomUser, Cart, CartItem, Order, userPayment


class MediNestAdminSite(UnfoldAdminSite):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('', self.admin_view(self.dashboard_view), name='index'),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        today = timezone.now()
        total_products = Product.objects.count()
        total_users = CustomUser.objects.count()
        total_orders = Order.objects.count()
        total_revenue = userPayment.objects.filter(status='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        pending_orders = Order.objects.filter(status='pending').count()
        shipped_orders = Order.objects.filter(status='shipped').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        paid_orders = Order.objects.filter(status='paid').count()
        
        # Recent orders
        recent_orders = Order.objects.select_related('user').prefetch_related('cartitem_set').order_by('-created_at')[:10]
        
        # Low stock products
        low_stock_products = Product.objects.filter(stock__lt=10).order_by('stock')[:10]
        
        # Sales data for last 7 days
        labels = []
        sales_data = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            labels.append(date.strftime('%Y-%m-%d'))
            day_revenue = userPayment.objects.filter(
                status='PAID',
                created_at__date=date.date()
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            sales_data.append(float(day_revenue))
        
        context = {
            'total_products': total_products,
            'total_users': total_users,
            'total_orders': total_orders,
            'total_revenue': f"{float(total_revenue):.2f}",
            'pending_orders': pending_orders,
            'shipped_orders': shipped_orders,
            'delivered_orders': delivered_orders,
            'paid_orders': paid_orders,
            'recent_orders': recent_orders,
            'low_stock_products': low_stock_products,
            'labels': labels,
            'sales_data': sales_data,
            'title': 'Dashboard',
        }
        
        request.current_app = self.name
        return TemplateResponse(request, 'admin/dashboard.html', context)


admin_site = MediNestAdminSite(name='admin')


class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'thumbnail', 'name', 'category', 'price', 'stock', 'prescription_required', 'created_at')
    list_filter = ('category', 'prescription_required')
    search_fields = ('name', 'generic_name', 'description')
    list_editable = ('stock', 'price')
    
    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" />', obj.image.url)
        return '-'
    thumbnail.short_description = 'Image'


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'city', 'phone', 'country', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'phone')


class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'items_count', 'created')
    def items_count(self, obj): return obj.cart_items.count()
    items_count.short_description = 'Items'
    def created(self, obj): return obj.user.date_joined if obj.user else '-'
    created.short_description = 'User Since'


class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_img', 'product', 'product_category', 'product_price', 'quantity', 'subtotal', 'user', 'order_id', 'prescription')
    search_fields = ('product__name', 'cart__user__username')
    list_filter = ('product__category',)
    
    def product_img(self, obj):
        if obj.product and obj.product.image:
            return format_html('<img src="{}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" />', obj.product.image.url)
        return '-'
    product_img.short_description = 'Img'
    def product_category(self, obj): return obj.product.get_category_display() if obj.product else '-'
    product_category.short_description = 'Cat'
    def product_price(self, obj): return obj.product.price if obj.product else '-'
    product_price.short_description = 'Price'
    def subtotal(self, obj): return float(obj.product.price) * obj.quantity if obj.product else '-'
    subtotal.short_description = 'Subtotal'
    def user(self, obj): return obj.cart.user.username if obj.cart and obj.cart.user else '-'
    user.short_description = 'User'
    def order_id(self, obj): return f"#{obj.order.id}" if obj.order else 'Cart'
    order_id.short_description = 'Order'
    def prescription(self, obj): return 'Yes' if obj.prescription_file else 'No'
    prescription.short_description = 'Rx'


class CartItemInline(admin.TabularInline):
    model = CartItem
    readonly_fields = ('product', 'product_image', 'quantity', 'line_total', 'prescription_file')
    can_delete = False
    extra = 0
    
    def product_image(self, obj):
        if obj.product and obj.product.image:
            return format_html('<img src="{}" style="width:60px;height:60px;object-fit:cover;border-radius:5px;" />', obj.product.image.url)
        return '-'
    product_image.short_description = 'Image'
    def line_total(self, obj):
        if obj.product and obj.quantity:
            return f"Rs. {float(obj.product.price) * obj.quantity}"
        return "-"
    line_total.short_description = 'Subtotal'
    def has_add_permission(self, request, obj=None): return False


class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'delivery_status', 'status',
        'user_username', 'user_email', 'user_phone', 'user_city',
        'products_with_images', 'item_count',
        'payment_status', 'payment_method', 'transaction_id', 'amount', 'tax', 'total_amount',
        'address', 'has_prescription', 'created_at'
    )
    
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__username', 'user__email', 'user__phone', 'address')
    readonly_fields = ('created_at', 'updated_at', 'complete_order_details', 'all_products_detail', 'all_payment_detail', 'all_user_detail', 'all_cartitem_detail')
    inlines = [CartItemInline]
    list_editable = ('status',)
    list_per_page = 20
    
    def delivery_status(self, obj):
        colors = {'pending': '#856404', 'processing': '#0d6efd', 'shipped': '#004085', 'delivered': '#155724'}
        return format_html('<span style="background:{};color:white;padding:4px 12px;border-radius:15px;font-size:11px;font-weight:600;">{}</span>', 
                          colors.get(obj.status, '#333'), obj.status.upper())
    delivery_status.short_description = 'DELIVERY STATUS'
    
    def user_username(self, obj): return obj.user.username if obj.user else '-'
    user_username.short_description = 'User'
    def user_email(self, obj): return obj.user.email if obj.user else '-'
    user_email.short_description = 'Email'
    def user_phone(self, obj): return obj.user.phone if obj.user else '-'
    user_phone.short_description = 'Phone'
    def user_city(self, obj): return obj.user.city if obj.user else '-'
    user_city.short_description = 'City'
    
    def item_count(self, obj): return obj.cartitem_set.count()
    item_count.short_description = 'Items'
    
    def products_with_images(self, obj):
        items = obj.cartitem_set.all()
        if not items: return "No items"
        html = '<div style="display:flex;flex-wrap:wrap;gap:5px;">'
        for item in items:
            if item.product and item.product.image:
                html += format_html(
                    '<div style="position:relative;"><img src="{}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:2px solid #ddd;" />'
                    '<span style="position:absolute;bottom:-5px;right:-5px;background:#667eea;color:white;font-size:9px;padding:1px 4px;border-radius:10px;">{}</span></div>',
                    item.product.image.url, item.quantity
                )
            else:
                html += format_html(
                    '<div style="width:40px;height:40px;background:#eee;border-radius:4px;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:10px;">{}</div>',
                    item.quantity
                )
        html += '</div>'
        return format_html(html)
    products_with_images.short_description = 'PRODUCTS'
    
    def payment_status(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                colors = {'PAID': '#28a745', 'PENDING': '#ffc107', 'FAILED': '#dc3545', 'REFUNDED': '#6f42c1'}
                return format_html('<span style="background:{};color:white;padding:4px 12px;border-radius:15px;font-size:11px;font-weight:600;">{}</span>', 
                                  colors.get(p.status, '#333'), p.status)
        except: pass
        return format_html('<span style="background:#999;color:white;padding:4px 12px;border-radius:15px;font-size:11px;">NO PAYMENT</span>')
    payment_status.short_description = 'PAYMENT STATUS'
    
    def payment_method(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p: return p.get_payment_method_display()
        except: pass
        return '-'
    payment_method.short_description = 'Method'
    def transaction_id(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p: return p.transaction_uuid[:16] + '...' if len(p.transaction_uuid) > 16 else p.transaction_uuid
        except: pass
        return '-'
    transaction_id.short_description = 'TxnID'
    def amount(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p: return f"Rs.{p.amount}"
        except: pass
        return '-'
    amount.short_description = 'Amt'
    def tax(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p: return f"Rs.{p.tax_amount}"
        except: pass
        return '-'
    tax.short_description = 'Tax'
    def total_amount(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p: return f"Rs.{p.total_amount}"
        except: pass
        return '-'
    total_amount.short_description = 'Total'
    def has_prescription(self, obj): return 'YES' if obj.prescription else 'NO'
    has_prescription.short_description = 'Rx'
    
    def complete_order_details(self, obj):
        items = obj.cartitem_set.all()
        html = '<h2 style="margin:20px 0 10px;color:#333;">=== COMPLETE ORDER & DELIVERY STATUS ===</h2>'
        html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
        
        html += '<tr style="background:#e3f2fd;"><td colspan="2"><strong>DELIVERY STATUS</strong></td></tr>'
        html += f'<tr><td width="200">Order ID</td><td>{obj.id}</td></tr>'
        html += f'<tr><td><strong>Delivery Status</strong></td><td><strong>{obj.status.upper()}</strong></td></tr>'
        html += f'<tr><td>Total Price</td><td>Rs. {obj.total_price}</td></tr>'
        html += f'<tr><td>Total Items</td><td>{items.count()}</td></tr>'
        html += f'<tr><td>Delivery Address</td><td>{obj.address}</td></tr>'
        html += f'<tr><td>Prescription</td><td>{"YES: " + str(obj.prescription) if obj.prescription else "NO"}</td></tr>'
        html += f'<tr><td>Order Created</td><td>{obj.created_at}</td></tr>'
        html += f'<tr><td>Order Updated</td><td>{obj.updated_at}</td></tr>'
        
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                html += '<tr style="background:#d4edda;"><td colspan="2"><strong>PAYMENT STATUS</strong></td></tr>'
                html += f'<tr><td>Payment Status</td><td><strong>{p.status}</strong></td></tr>'
                html += f'<tr><td>Payment Method</td><td>{p.get_payment_method_display()}</td></tr>'
                html += f'<tr><td>Transaction ID</td><td>{p.transaction_uuid}</td></tr>'
                html += f'<tr><td>Amount</td><td>Rs. {p.amount}</td></tr>'
                html += f'<tr><td>Tax</td><td>Rs. {p.tax_amount}</td></tr>'
                html += f'<tr><td>Total Paid</td><td><strong>Rs. {p.total_amount}</strong></td></tr>'
        except: pass
        
        if obj.user:
            html += '<tr style="background:#fff3cd;"><td colspan="2"><strong>CUSTOMER DATA</strong></td></tr>'
            html += f'<tr><td>User ID</td><td>{obj.user.id}</td></tr>'
            html += f'<tr><td>Username</td><td>{obj.user.username}</td></tr>'
            html += f'<tr><td>Email</td><td>{obj.user.email}</td></tr>'
            html += f'<tr><td>Phone</td><td>{obj.user.phone or "N/A"}</td></tr>'
            html += f'<tr><td>City</td><td>{obj.user.city or "N/A"}</td></tr>'
        
        html += '</table>'
        return format_html(html)
    complete_order_details.short_description = 'Complete Order (Delivery + Payment)'
    
    def all_products_detail(self, obj):
        items = obj.cartitem_set.all()
        html = '<h2 style="margin:20px 0 10px;color:#333;">=== ALL PRODUCTS WITH IMAGES ===</h2>'
        if items:
            html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
            html += '<tr style="background:#e3f2fd;">'
            html += '<th>Img</th><th>#</th><th>ProductID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Qty</th><th>Subtotal</th>'
            html += '</tr>'
            for idx, item in enumerate(items, 1):
                p = item.product
                img_html = ''
                if p and p.image:
                    img_html = format_html('<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" />', p.image.url)
                html += '<tr>'
                html += f'<td>{img_html}</td>'
                html += f'<td>{idx}</td>'
                html += f'<td>{p.id if p else "-"}</td>'
                html += f'<td><strong>{p.name if p else "Unknown"}</strong></td>'
                html += f'<td>{p.get_category_display() if p else "-"}</td>'
                html += f'<td>Rs.{p.price if p else 0}</td>'
                html += f'<td>{p.stock if p else 0}</td>'
                html += f'<td><strong>{item.quantity}</strong></td>'
                subtotal = float(p.price) * item.quantity if p else 0
                html += f'<td>Rs.{subtotal}</td>'
                html += '</tr>'
            html += '</table>'
            html += f'<p style="margin-top:15px;font-size:18px;font-weight:bold;background:#e8f5e9;padding:10px;border-radius:5px;">ORDER TOTAL: Rs. {obj.total_price}</p>'
        else:
            html += '<p>No products</p>'
        return format_html(html)
    all_products_detail.short_description = 'All Products with Images'
    
    def all_payment_detail(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                html = '<h2 style="margin:20px 0 10px;color:#333;">=== COMPLETE PAYMENT DATA ===</h2>'
                html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
                html += f'<tr><td width="200">Payment ID</td><td>{p.id}</td></tr>'
                html += f'<tr><td><strong>Payment Status</strong></td><td><strong>{p.status}</strong></td></tr>'
                html += f'<tr><td>Payment Method</td><td>{p.get_payment_method_display()}</td></tr>'
                html += f'<tr><td>Transaction UUID</td><td>{p.transaction_uuid}</td></tr>'
                html += f'<tr><td>Amount</td><td>Rs. {p.amount}</td></tr>'
                html += f'<tr><td>Tax</td><td>Rs. {p.tax_amount}</td></tr>'
                html += f'<tr><td><strong>TOTAL PAID</strong></td><td style="font-weight:bold;color:green;">Rs. {p.total_amount}</td></tr>'
                html += f'<tr><td>Created</td><td>{p.created_at}</td></tr>'
                html += '</table>'
                return format_html(html)
        except: pass
        return format_html('<p>No payment data</p>')
    all_payment_detail.short_description = 'Complete Payment Data'
    
    def all_user_detail(self, obj):
        if obj.user:
            u = obj.user
            html = '<h2 style="margin:20px 0 10px;color:#333;">=== COMPLETE CUSTOMER DATA ===</h2>'
            html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
            html += f'<tr><td width="200">User ID</td><td>{u.id}</td></tr>'
            html += f'<tr><td>Username</td><td>{u.username}</td></tr>'
            html += f'<tr><td>Email</td><td>{u.email}</td></tr>'
            html += f'<tr><td>Full Name</td><td>{u.first_name} {u.last_name}</td></tr>'
            html += f'<tr><td>Phone</td><td>{u.phone or "N/A"}</td></tr>'
            html += f'<tr><td>City</td><td>{u.city or "N/A"}</td></tr>'
            html += f'<tr><td>Date Joined</td><td>{u.date_joined}</td></tr>'
            html += '</table>'
            return format_html(html)
        return format_html('<p>No customer</p>')
    all_user_detail.short_description = 'Complete Customer Data'
    
    def all_cartitem_detail(self, obj):
        items = obj.cartitem_set.all()
        html = '<h2 style="margin:20px 0 10px;color:#333;">=== ALL CART ITEMS WITH IMAGES ===</h2>'
        if items:
            html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
            html += '<tr style="background:#e3f2fd;">'
            html += '<th>Image</th><th>ItemID</th><th>ProductID</th><th>Name</th><th>Category</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>User</th>'
            html += '</tr>'
            for item in items:
                p = item.product
                img_html = ''
                if p and p.image:
                    img_html = format_html('<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" />', p.image.url)
                cart_user = item.cart.user.username if item.cart and item.cart.user else 'N/A'
                html += '<tr>'
                html += f'<td>{img_html}</td>'
                html += f'<td>{item.id}</td>'
                html += f'<td>{p.id if p else "-"}</td>'
                html += f'<td><strong>{p.name if p else "Unknown"}</strong></td>'
                html += f'<td>{p.get_category_display() if p else "-"}</td>'
                html += f'<td>Rs.{p.price if p else 0}</td>'
                html += f'<td><strong>{item.quantity}</strong></td>'
                subtotal = float(p.price) * item.quantity if p else 0
                html += f'<td>Rs.{subtotal}</td>'
                html += f'<td>{cart_user}</td>'
                html += '</tr>'
            html += '</table>'
        else:
            html += '<p>No items</p>'
        return format_html(html)
    all_cartitem_detail.short_description = 'All Cart Items with Images'


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'txn_uuid', 'user_data', 'order_data', 'status', 'payment_method', 'amount', 'tax', 'total', 'txn_code', 'created')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('transaction_uuid', 'user__username', 'transaction_code')
    readonly_fields = ('transaction_uuid', 'created_at', 'updated_at')
    list_editable = ('status', 'payment_method')
    
    def txn_uuid(self, obj): return obj.transaction_uuid[:30] + '...' if len(obj.transaction_uuid) > 30 else obj.transaction_uuid
    txn_uuid.short_description = 'TransactionID'
    def user_data(self, obj):
        if obj.user: return f"{obj.user.username} | {obj.user.email}"
        return "N/A"
    user_data.short_description = 'User'
    def order_data(self, obj): return f"#{obj.order.id}" if obj.order else "N/A"
    order_data.short_description = 'Order'
    def payment_status(self, obj):
        colors = {'PAID': '#28a745', 'PENDING': '#ffc107', 'FAILED': '#dc3545', 'REFUNDED': '#6f42c1'}
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:15px;font-size:11px;">{}</span>', colors.get(obj.status, '#333'), obj.status)
    payment_status.short_description = 'PayStatus'
    def method(self, obj): return obj.get_payment_method_display()
    method.short_description = 'Method'
    def amount(self, obj): return f"Rs.{obj.amount}"
    amount.short_description = 'Amt'
    def tax(self, obj): return f"Rs.{obj.tax_amount}"
    tax.short_description = 'Tax'
    def total(self, obj): return f"Rs.{obj.total_amount}"
    total.short_description = 'Total'
    def txn_code(self, obj): return obj.transaction_code or '-'
    txn_code.short_description = 'Code'
    def created(self, obj): return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created.short_description = 'Created'
    
    def get_readonly_fields(self, request, obj=None):
        if obj: return ('transaction_uuid', 'created_at', 'updated_at')
        return ('created_at', 'updated_at')
    def has_add_permission(self, request): return False
    
    def save_model(self, request, obj, form, change):
        if not change and obj.payment_method == 'ONLINE':
            obj.status = 'PAID'
        if change and obj.order:
            try:
                original = userPayment.objects.get(pk=obj.pk)
                if obj.status != original.status:
                    if obj.status == 'PAID': obj.order.status = 'paid'
                    elif obj.status == 'FAILED': obj.order.status = 'pending'
                    elif obj.status == 'REFUNDED': obj.order.status = 'refunded'
                    obj.order.save()
            except: pass
        super().save_model(request, obj, form, change)


admin_site.register(Product, ProductAdmin)
admin_site.register(CustomUser, CustomUserAdmin)
admin_site.register(Cart, CartAdmin)
admin_site.register(CartItem, CartItemAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(userPayment, UserPaymentAdmin)

