from django.contrib import admin, messages
from django.contrib.admin import AdminSite
from django.template.response import TemplateResponse
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.utils import timezone
from django.urls import path
from django.shortcuts import render
from datetime import timedelta
from unfold.sites import UnfoldAdminSite
from .models import Product, CustomUser, Cart, CartItem, Order, userPayment, Category, PrescriptionVerification
from .views.orders import send_delivery_email
from django.contrib.auth.models import Group


class MediNestAdminSite(UnfoldAdminSite):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('', self.admin_view(self.dashboard_view), name='index'),
        ]
        return custom_urls + urls

    def get_app_list(self, request):
        app_list = super().get_app_list(request)
        if request.user.groups.filter(name='Delivery Boy').exists():
            # Filter to show Orders and UserPayment for delivery boys
            filtered_apps = []
            for app in app_list:
                if app['app_label'] == 'myapp':
                    app['models'] = [model for model in app['models'] if model['object_name'] in ['Order', 'UserPayment']]
                if app['models']:  # Only include apps that have models
                    filtered_apps.append(app)
            return filtered_apps
        return app_list
                
    def dashboard_view(self, request):
        if request.user.groups.filter(name='Delivery Boy').exists():
            # Redirect delivery boys to orders list instead of dashboard
            from django.shortcuts import redirect
            return redirect('admin:myapp_order_changelist')

        today = timezone.now()
        total_products = Product.objects.count()
        total_users = CustomUser.objects.count()
        total_orders = Order.objects.count()
        total_revenue = userPayment.objects.filter(status='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        pending_orders = Order.objects.filter(status='pending').count()
        shipped_orders = Order.objects.filter(status='shipped').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        paid_orders = Order.objects.filter(status='paid').count()
        pending_prescriptions = PrescriptionVerification.objects.filter(status='pending').count()

        recent_orders = Order.objects.select_related('user').prefetch_related('cartitem_set').order_by('-created_at')[:10]
        low_stock_products = Product.objects.filter(stock__lt=10).order_by('stock')[:10]

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
            'pending_prescriptions': pending_prescriptions,
            'recent_orders': recent_orders,
            'low_stock_products': low_stock_products,
            'labels': labels,
            'sales_data': sales_data,
            'title': 'Dashboard',
        }

        request.current_app = self.name
        return TemplateResponse(request, 'admin/dashboard.html', context)


admin_site = MediNestAdminSite(name='admin')
                    

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'icon', 'value', 'label', 'order', 'is_active', 'product_count', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('value', 'label', 'description')
    list_editable = ('order', 'is_active')
    ordering = ['order', 'label']
    
    def icon(self, obj):
        if obj.icon:
            return format_html('<span style="font-size:20px;">{}</span>', obj.icon)
        return '-'
    icon.short_description = 'Icon'
    
    def product_count(self, obj):
        count = obj.products.count()
        return f"{count} products"
    product_count.short_description = 'Products'


class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'thumbnail', 'name', 'category_display', 'price', 'stock', 'prescription_required', 'created_at')
    list_filter = ('category', 'prescription_required')
    search_fields = ('name', 'generic_name', 'description')
    list_editable = ('stock', 'price', 'prescription_required')
    
    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" />', obj.image.url)
        return '-'
    thumbnail.short_description = 'Image'
    
    def category_display(self, obj):
        if obj.category:
            return obj.category.label
        return '-'
    category_display.short_description = 'Category'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs["queryset"] = Category.objects.filter(is_active=True).order_by('order', 'label')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'city', 'phone', 'country', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'phone')


class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'items_count', 'created')
    
    def items_count(self, obj):
        return obj.cart_items.count()
    items_count.short_description = 'Items'
    
    def created(self, obj):
        return obj.user.date_joined if obj.user else '-'
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
    
    def product_category(self, obj): 
        if obj.product and obj.product.category:
            return obj.product.category.label
        return '-'
    product_category.short_description = 'Cat'
    
    def product_price(self, obj):
        return obj.product.price if obj.product else '-'
    product_price.short_description = 'Price'
    
    def subtotal(self, obj):
        return float(obj.product.price) * obj.quantity if obj.product else '-'
    subtotal.short_description = 'Subtotal'
    
    def user(self, obj):
        return obj.cart.user.username if obj.cart and obj.cart.user else '-'
    user.short_description = 'User'
    
    def order_id(self, obj):
        return f"#{obj.order.id}" if obj.order else 'Cart'
    order_id.short_description = 'Order'
    
    def prescription(self, obj):
        return 'Yes' if obj.prescription_file else 'No'
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
    
    def has_add_permission(self, request, obj=None):
        return False


class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'delivery_status', 'status',
        'user_username', 'user_email', 'user_phone', 'user_city',
        'products_with_images', 'item_count',
        'payment_status', 'payment_method', 'transaction_id', 'amount', 'tax', 'total_amount',
        'address', 'has_prescription', 'prescription_verification_status', 'prescription_thumbnail', 'created_at'
    )

    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__username', 'user__email', 'user__phone', 'address')
    readonly_fields = ('created_at', 'updated_at', 'complete_order_details', 'all_products_detail', 'all_payment_detail', 'all_user_detail', 'all_cartitem_detail')
    inlines = [CartItemInline]
    list_editable = ('status',)
    list_per_page = 20
    actions = ['mark_cash_payment_received']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.groups.filter(name='Delivery Boy').exists():
            # Delivery boys should see all orders to understand the full context
            # They can work on any order that's not already delivered or canceled
            pass  # Show all orders for now
        return qs
            
    def get_list_display(self, request):
        if request.user.groups.filter(name='Delivery Boy').exists():
            
            return ('user_username', 'address', 'status', 'payment_status')
        return super().get_list_display(request)
    def get_list_editable(self, request):
        if request.user.groups.filter(name='Delivery Boy').exists():
            return ('status', 'payment_status')
        return super().get_list_editable(request)
            
    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if request.user.groups.filter(name='Delivery Boy').exists() and db_field.name == 'status':
            # Allow delivery boys to see current status and change to 'delivered' or 'canceled'
            kwargs['choices'] = [
                ('pending', 'Pending'),
                ('delivered', 'Delivered'),
                ('canceled', 'Canceled'),
            ]
        return super().formfield_for_choice_field(db_field, request, **kwargs)
                        
                                
    def has_add_permission(self, request):
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        if request.user.groups.filter(name='Delivery Boy').exists():
            return False
        return super().has_delete_permission(request, obj)

    def save_model(self, request, obj, form, change):
        """Override save_model to handle cash on delivery logic for delivery boys and send delivery emails"""
        # Track if status is changing to 'delivered'
        old_status = None
        if change:
            try:
                old_status = Order.objects.get(pk=obj.pk).status
            except Order.DoesNotExist:
                pass

        # Handle cash on delivery logic for delivery boys
        if request.user.groups.filter(name='Delivery Boy').exists():
            if obj.status == 'delivered':
                # Check if payment method is CASH_ON_DELIVERY and update payment status
                try:
                    payment = userPayment.objects.filter(order=obj).first()
                    if payment and payment.payment_method == 'CASH_ON_DELIVERY':
                        payment.status = 'PAID'
                        payment.save()
                except Exception as e:
                    # Log error but don't prevent save
                    pass

        # Save the order first
        super().save_model(request, obj, form, change)

        # Send delivery email if status changed to 'delivered'
        if change and old_status != 'delivered' and obj.status == 'delivered':
            try:
                email_sent = send_delivery_email(obj)
                if email_sent:
                    self.message_user(request, f"✓ Delivery email sent to {obj.user.email}", messages.SUCCESS)
                else:
                    self.message_user(request, "⚠ Order marked delivered but email could not be sent", messages.WARNING)
            except Exception as e:
                self.message_user(request, f"⚠ Error sending delivery email: {str(e)}", messages.ERROR)
                    
    def mark_cash_payment_received(self, request, queryset):
        """Mark cash payments as received for selected orders"""
        updated_count = 0
        for order in queryset:
            try:
                payment = userPayment.objects.filter(order=order).first()
                if payment and payment.payment_method == 'CASH_ON_DELIVERY' and payment.status != 'PAID':
                    payment.status = 'PAID'
                    payment.save()
                    updated_count += 1
            except Exception as e:
                # Log error but continue with other orders
                pass

        if updated_count > 0:
            self.message_user(request, f'{updated_count} cash payment(s) marked as received.')
        else:
            self.message_user(request, 'No cash payments were updated. Make sure orders have cash on delivery payment method.')
    mark_cash_payment_received.short_description = '💰 Mark cash payment received'
            
    def delivery_status(self, obj):
        colors = {
            'pending': '#856404',
            'processing': '#0d6efd',
            'confirmed': '#17a2b8',
            'packed': '#6f42c1',
            'shipped': '#004085',
            'out_for_delivery': '#fd7e14',
            'delivered': '#155724',
            'canceled': '#dc3545',
            'returned': '#6c757d'
        }
        return format_html('<span style="background:{};color:white;padding:4px 12px;border-radius:15px;font-size:11px;font-weight:600;">{}</span>',
                          colors.get(obj.status, '#333'), obj.status.upper())
        delivery_status.short_description = 'DELIVERY STATUS'
        
    def user_username(self, obj):
        return obj.user.username if obj.user else '-'
    user_username.short_description = 'User'
    
    def user_email(self, obj):
        return obj.user.email if obj.user else '-'
    user_email.short_description = 'Email'
    
    def user_phone(self, obj):
        return obj.user.phone if obj.user else '-'
    user_phone.short_description = 'Phone'
    
    def user_city(self, obj):
        return obj.user.city if obj.user else '-'
    user_city.short_description = 'City'
    
    def item_count(self, obj):
        return obj.cartitem_set.count()
    item_count.short_description = 'Items'
    
    def products_with_images(self, obj):
        items = obj.cartitem_set.all()
        if not items:
            return "No items"
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
        except:
            pass
        return format_html('<span style="background:#999;color:white;padding:4px 12px;border-radius:15px;font-size:11px;">NO PAYMENT</span>')
    payment_status.short_description = 'PAYMENT STATUS'
    
    def payment_method(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                return p.get_payment_method_display()
        except:
            pass
        return '-'
    payment_method.short_description = 'Method'
    
    def transaction_id(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                return p.transaction_uuid[:16] + '...' if len(p.transaction_uuid) > 16 else p.transaction_uuid
        except:
            pass
        return '-'
    transaction_id.short_description = 'TxnID'
    
    def amount(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                return f"Rs.{p.amount}"
        except:
            pass
        return '-'
    amount.short_description = 'Amt'
    
    def tax(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                return f"Rs.{p.tax_amount}"
        except:
            pass
        return '-'
    tax.short_description = 'Tax'
    
    def total_amount(self, obj):
        try:
            p = userPayment.objects.filter(order=obj).first()
            if p:
                return f"Rs.{p.total_amount}"
        except:
            pass
        return '-'
    total_amount.short_description = 'Total'
    
    def has_prescription(self, obj):
        return 'YES' if obj.prescription else 'NO'
    has_prescription.short_description = 'Rx'
    
    def prescription_verification_status(self, obj):
        """Display prescription verification status from PrescriptionVerification model"""
        try:
            from .models import PrescriptionVerification
            verification = PrescriptionVerification.objects.filter(order=obj).first()
            if verification:
                colors = {
                    'pending': '#ffc107',
                    'approved': '#28a745',
                    'rejected': '#dc3545',
                }
                return format_html(
                    '<span style="background:{};color:white;padding:3px 10px;'
                    'border-radius:12px;font-size:10px;font-weight:600;">{}</span>',
                    colors.get(verification.status, '#6c757d'), 
                    verification.status.upper()
                )
            return format_html('<span style="color:#6c757d;">-</span>')
        except:
            return format_html('<span style="color:#6c757d;">-</span>')
    prescription_verification_status.short_description = 'Rx Status'
    
    def prescription_thumbnail(self, obj):
        if obj.prescription:
            return format_html('<a href="{}" target="_blank"><img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;border:2px solid #dc3545;" /></a>', 
                              obj.prescription.url, obj.prescription.url)
        return '-'
    prescription_thumbnail.short_description = 'Rx Image'
    
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
        except:
            pass
        
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
                cat_label = p.category.label if p and p.category else '-'
                html += '<tr>'
                html += f'<td>{img_html}</td>'
                html += f'<td>{idx}</td>'
                html += f'<td>{p.id if p else "-"}</td>'
                html += f'<td><strong>{p.name if p else "Unknown"}</strong></td>'
                html += f'<td>{cat_label}</td>'
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
        except:
            pass
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
                cat_label = p.category.label if p and p.category else '-'
                cart_user = item.cart.user.username if item.cart and item.cart.user else 'N/A'
                html += '<tr>'
                html += f'<td>{img_html}</td>'
                html += f'<td>{item.id}</td>'
                html += f'<td>{p.id if p else "-"}</td>'
                html += f'<td><strong>{p.name if p else "Unknown"}</strong></td>'
                html += f'<td>{cat_label}</td>'
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
    
    def txn_uuid(self, obj):
        return obj.transaction_uuid[:30] + '...' if len(obj.transaction_uuid) > 30 else obj.transaction_uuid
    txn_uuid.short_description = 'TransactionID'
    
    def user_data(self, obj):
        if obj.user:
            return f"{obj.user.username} | {obj.user.email}"
        return "N/A"
    user_data.short_description = 'User'
    
    def order_data(self, obj):
        return f"#{obj.order.id}" if obj.order else "N/A"
    order_data.short_description = 'Order'
    
    def payment_status(self, obj):
        colors = {'PAID': '#28a745', 'PENDING': '#ffc107', 'FAILED': '#dc3545', 'REFUNDED': '#6f42c1'}
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:15px;font-size:11px;">{}</span>', colors.get(obj.status, '#333'), obj.status)
    payment_status.short_description = 'PayStatus'
    
    def method(self, obj):
        return obj.get_payment_method_display()
    method.short_description = 'Method'
    
    def amount(self, obj):
        return f"Rs.{obj.amount}"
    amount.short_description = 'Amt'
    
    def tax(self, obj):
        return f"Rs.{obj.tax_amount}"
    tax.short_description = 'Tax'
    
    def total(self, obj):
        return f"Rs.{obj.total_amount}"
    total.short_description = 'Total'
    
    def txn_code(self, obj):
        return obj.transaction_code or '-'
    txn_code.short_description = 'Code'
    
    def created(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created.short_description = 'Created'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ('transaction_uuid', 'created_at', 'updated_at')
        return ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        return False
    
    def save_model(self, request, obj, form, change):
        if not change and obj.payment_method == 'ONLINE':
            obj.status = 'PAID'
        if change and obj.order:
            try:
                original = userPayment.objects.get(pk=obj.pk)
                if obj.status != original.status:
                    if obj.status == 'PAID':
                        obj.order.status = 'paid'
                    elif obj.status == 'FAILED':
                        obj.order.status = 'pending'
                    elif obj.status == 'REFUNDED':
                        obj.order.status = 'refunded'
                    obj.order.save()
            except:
                pass
        super().save_model(request, obj, form, change)


class PrescriptionVerificationAdmin(admin.ModelAdmin):
    """
    Enhanced admin for Prescription Verification with comprehensive OCR details
    and order connection information
    """
    list_display = (
        'id', 'status_badge', 'order_summary', 'prescription_thumbnail',
        'doctor_info', 'hospital_info', 'medicine_summary',
        'ocr_confidence_badge', 'patient_summary', 'created_at', 'status'
    )
    list_filter = ('status', 'ocr_confidence', 'department', 'created_at')
    search_fields = (
        'order__id', 'extracted_nmc_number', 'doctor_name', 
        'hospital_name', 'department', 'patient_name', 'verification_notes'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'order_connection_display', 'prescription_image_display',
        'ocr_raw_text_display', 'ocr_metadata_display', 'verified_at', 'verified_by'
    )
    list_editable = ('status',)
    list_display_links = ('id', 'order_summary')
    actions = ['approve_prescriptions', 'reject_prescriptions', 'reprocess_ocr']
    
    fieldsets = (
        ('Order Connection', {
            'fields': ('order',),
            'classes': ('wide',)
        }),
        ('Prescription Image', {
            'fields': ('prescription_image',),
            'classes': ('wide',)
        }),
        ('OCR Extracted Doctor Information', {
            'fields': (
                'extracted_nmc_number', 'doctor_name', 'hospital_name',
                'department', 'ocr_confidence'
            ),
            'classes': ('collapse',)
        }),
        ('OCR Extracted Patient Information', {
            'fields': ('patient_name', 'patient_age', 'patient_gender', 'chief_complaints', 'followup_date'),
            'classes': ('collapse',)
        }),
        ('OCR Extracted Medicines', {
            'fields': ('medicine_list',),
            'classes': ('wide', 'collapse')
        }),
        ('Verification Status', {
            'fields': ('status', 'verification_notes')
        }),
    )
    
    def order_summary(self, obj):
        """Display order summary with link"""
        if obj.order:
            url = f"/admin/myapp/order/{obj.order.id}/change/"
            user = obj.order.user
            return format_html(
                '<div style="line-height:1.4;">'
                '<a href="{}" style="font-weight:bold;color:#667eea;">Order #{}</a><br>'
                '<small style="color:#666;">{}</small><br>'
                '<small style="color:#666;">{}</small>'
                '</div>',
                url, obj.order.id,
                user.username if user else 'No user',
                user.email if user else ''
            )
        return format_html('<span style="color:#dc3545;">No Order</span>')
    order_summary.short_description = 'Order Info'
    
    def prescription_thumbnail(self, obj):
        """Display prescription thumbnail"""
        if obj.prescription_image:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="width:80px;height:80px;object-fit:cover;'
                'border-radius:6px;border:2px solid #667eea;" />'
                '</a>',
                obj.prescription_image.url, obj.prescription_image.url
            )
        return format_html(
            '<div style="width:80px;height:80px;background:#f8f9fa;'
            'border-radius:6px;border:2px dashed #dee2e6;display:flex;'
            'align-items:center;justify-content:center;color:#6c757d;'
            'font-size:11px;">No Image</div>'
        )
    prescription_thumbnail.short_description = 'Prescription'
    
    def doctor_info(self, obj):
        """Display doctor information from OCR"""
        if obj.doctor_name or obj.extracted_nmc_number:
            html = '<div style="line-height:1.5;">'
            if obj.doctor_name:
                html += f'<div><strong style="color:#333;">Dr. {obj.doctor_name}</strong></div>'
            if obj.extracted_nmc_number:
                html += f'<div><small style="color:#666;">NMC: {obj.extracted_nmc_number}</small></div>'
            if obj.department:
                html += f'<div><small style="color:#17a2b8;">{obj.department}</small></div>'
            html += '</div>'
            return format_html(html)
        return format_html('<span style="color:#6c757d;">Not detected</span>')
    doctor_info.short_description = 'Doctor Info'
    
    def hospital_info(self, obj):
        """Display hospital information"""
        if obj.hospital_name:
            return format_html(
                '<div style="line-height:1.4;">'
                '<div style="font-weight:500;color:#333;">{}</div>'
                '</div>',
                obj.hospital_name
            )
        return format_html('<span style="color:#6c757d;">-</span>')
    hospital_info.short_description = 'Hospital'
    
    def medicine_summary(self, obj):
        """Display medicine count and summary"""
        if obj.medicine_list and isinstance(obj.medicine_list, list):
            count = len(obj.medicine_list)
            if count > 0:
                # Show first 2 medicines
                meds_preview = []
                for med in obj.medicine_list[:2]:
                    if isinstance(med, dict):
                        name = med.get('name', 'Unknown')
                        dosage = med.get('dosage', '')
                        meds_preview.append(f"{name} {dosage}")
                
                preview_text = ', '.join(meds_preview)
                if count > 2:
                    preview_text += f' <span style="color:#667eea;">+{count-2} more</span>'
                
                return format_html(
                    '<div style="line-height:1.4;">'
                    '<span style="background:#17a2b8;color:white;padding:2px 8px;'
                    'border-radius:10px;font-size:11px;font-weight:600;">{} meds</span>'
                    '<div style="margin-top:4px;font-size:12px;color:#555;">{}</div>'
                    '</div>',
                    count, preview_text
                )
        
        return format_html(
            '<span style="background:#6c757d;color:white;padding:2px 8px;'
            'border-radius:10px;font-size:11px;">0 meds</span>'
        )
    medicine_summary.short_description = 'Medicines'
    
    def patient_summary(self, obj):
        """Display patient information summary"""
        if obj.patient_name or obj.patient_age or obj.patient_gender:
            html = '<div style="line-height:1.4;font-size:12px;">'
            if obj.patient_name:
                html += f'<div><strong>{obj.patient_name}</strong></div>'
            details = []
            if obj.patient_age:
                details.append(obj.patient_age)
            if obj.patient_gender:
                details.append(obj.patient_gender)
            if details:
                html += f'<div style="color:#666;">{", ".join(details)}</div>'
            html += '</div>'
            return format_html(html)
        return format_html('<span style="color:#6c757d;">-</span>')
    patient_summary.short_description = 'Patient'
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'pending': '#ffc107',
            'approved': '#28a745',
            'rejected': '#dc3545',
        }
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:15px;font-size:11px;font-weight:600;">{}</span>',
            colors.get(obj.status, '#6c757d'), obj.status.upper()
        )
    status_badge.short_description = 'Status'
    
    def ocr_confidence_badge(self, obj):
        """Display OCR confidence as colored badge"""
        colors = {
            'high': '#28a745',
            'medium': '#ffc107',
            'low': '#dc3545',
        }
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:15px;font-size:11px;font-weight:600;">{}</span>',
            colors.get(obj.ocr_confidence, '#6c757d'), obj.ocr_confidence.upper()
        )
    ocr_confidence_badge.short_description = 'OCR Quality'
    
    def order_connection_display(self, obj):
        """Display detailed order connection information"""
        if not obj.order:
            return format_html('<div style="color:#dc3545;">No order connected</div>')
        
        order = obj.order
        user = order.user
        
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += '<h3 style="margin:0 0 10px 0;color:#333;">Order Details</h3>'
        html += '<table style="width:100%;border-collapse:collapse;">'
        
        # Order Info
        html += '<tr><td style="padding:5px;color:#666;">Order ID</td>'
        html += f'<td style="padding:5px;font-weight:600;">#{order.id}</td></tr>'
        
        html += '<tr><td style="padding:5px;color:#666;">Status</td>'
        html += f'<td style="padding:5px;"><span style="background:#667eea;color:white;'
        html += f'padding:2px 8px;border-radius:4px;font-size:12px;">{order.status}</span></td></tr>'
        
        html += '<tr><td style="padding:5px;color:#666;">Total</td>'
        html += f'<td style="padding:5px;font-weight:600;">Rs. {order.total_price}</td></tr>'
        
        html += '<tr><td style="padding:5px;color:#666;">Address</td>'
        html += f'<td style="padding:5px;">{order.address}</td></tr>'
        
        # User Info
        if user:
            html += '<tr><td colspan="2" style="padding:10px 5px;border-top:1px solid #dee2e6;">'
            html += '<strong style="color:#333;">Customer Information</strong></td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">Name</td>'
            html += f'<td style="padding:5px;">{user.get_full_name() or user.username}</td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">Email</td>'
            html += f'<td style="padding:5px;">{user.email}</td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">Phone</td>'
            html += f'<td style="padding:5px;">{user.phone or "N/A"}</td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">City</td>'
            html += f'<td style="padding:5px;">{user.city or "N/A"}</td></tr>'
        
        # Payment Info
        try:
            payment = userPayment.objects.filter(order=order).first()
            if payment:
                html += '<tr><td colspan="2" style="padding:10px 5px;border-top:1px solid #dee2e6;">'
                html += '<strong style="color:#333;">Payment Information</strong></td></tr>'
                
                html += f'<tr><td style="padding:5px;color:#666;">Status</td>'
                html += f'<td style="padding:5px;"><span style="background:#28a745;color:white;'
                html += f'padding:2px 8px;border-radius:4px;font-size:12px;">{payment.status}</span></td></tr>'
                
                html += f'<tr><td style="padding:5px;color:#666;">Method</td>'
                html += f'<td style="padding:5px;">{payment.get_payment_method_display()}</td></tr>'
                
                html += f'<tr><td style="padding:5px;color:#666;">Amount</td>'
                html += f'<td style="padding:5px;font-weight:600;">Rs. {payment.total_amount}</td></tr>'
        except:
            pass
        
        # Cart Items
        items = order.cartitem_set.all()
        if items:
            html += '<tr><td colspan="2" style="padding:10px 5px;border-top:1px solid #dee2e6;">'
            html += f'<strong style="color:#333;">Order Items ({items.count()})</strong></td></tr>'
            html += '<tr><td colspan="2" style="padding:5px;">'
            html += '<div style="display:flex;flex-wrap:wrap;gap:10px;">'
            
            for item in items:
                if item.product:
                    img_url = item.product.image.url if item.product.image else ''
                    html += f'<div style="display:flex;align-items:center;gap:8px;'
                    html += f'background:white;padding:8px;border-radius:6px;border:1px solid #dee2e6;">'
                    if img_url:
                        html += f'<img src="{img_url}" style="width:40px;height:40px;'
                        html += f'object-fit:cover;border-radius:4px;" />'
                    html += f'<div><div style="font-weight:500;font-size:12px;">{item.product.name}</div>'
                    html += f'<div style="font-size:11px;color:#666;">Qty: {item.quantity}</div></div>'
                    html += '</div>'
            
            html += '</div></td></tr>'
        
        html += '</table></div>'
        return format_html(html)
    order_connection_display.short_description = 'Connected Order Details'
    
    def prescription_image_display(self, obj):
        """Display full prescription image"""
        if obj.prescription_image:
            return format_html(
                '<div style="text-align:center;">'
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:500px;max-height:500px;'
                'border-radius:8px;border:2px solid #667eea;box-shadow:0 4px 6px rgba(0,0,0,0.1);" />'
                '</a><br>'
                '<small style="color:#666;">Click image to view full size</small>'
                '</div>',
                obj.prescription_image.url, obj.prescription_image.url
            )
        return format_html('<div style="color:#dc3545;">No prescription image uploaded</div>')
    prescription_image_display.short_description = 'Prescription Image'
    
    def extracted_medicines_display(self, obj):
        """Display extracted medicines in a formatted table"""
        if not obj.medicine_list or not isinstance(obj.medicine_list, list):
            return format_html('<div style="color:#6c757d;">No medicines detected by OCR</div>')
        
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += f'<h3 style="margin:0 0 15px 0;color:#333;">Detected Medicines ({len(obj.medicine_list)})</h3>'
        html += '<table style="width:100%;border-collapse:collapse;background:white;">'
        html += '<thead><tr style="background:#667eea;color:white;">'
        html += '<th style="padding:10px;text-align:left;">#</th>'
        html += '<th style="padding:10px;text-align:left;">Medicine Name</th>'
        html += '<th style="padding:10px;text-align:left;">Dosage</th>'
        html += '<th style="padding:10px;text-align:left;">Frequency</th>'
        html += '<th style="padding:10px;text-align:left;">Duration</th>'
        html += '<th style="padding:10px;text-align:left;">Confidence</th>'
        html += '</tr></thead><tbody>'
        
        for idx, med in enumerate(obj.medicine_list, 1):
            if isinstance(med, dict):
                name = med.get('name', 'Unknown')
                dosage = med.get('dosage', '-')
                frequency = med.get('frequency', '-')
                duration = med.get('duration', '-')
                confidence = med.get('confidence', 'low')
                
                conf_colors = {'high': '#28a745', 'medium': '#ffc107', 'low': '#dc3545'}
                conf_color = conf_colors.get(confidence, '#6c757d')
                
                html += f'<tr style="border-bottom:1px solid #dee2e6;">'
                html += f'<td style="padding:10px;">{idx}</td>'
                html += f'<td style="padding:10px;font-weight:500;">{name}</td>'
                html += f'<td style="padding:10px;">{dosage}</td>'
                html += f'<td style="padding:10px;">{frequency}</td>'
                html += f'<td style="padding:10px;">{duration}</td>'
                html += f'<td style="padding:10px;">'
                html += f'<span style="background:{conf_color};color:white;'
                html += f'padding:2px 8px;border-radius:10px;font-size:11px;">{confidence}</span>'
                html += f'</td></tr>'
        
        html += '</tbody></table></div>'
        return format_html(html)
    extracted_medicines_display.short_description = 'Extracted Medicines'
    
    def patient_info_display(self, obj):
        """Display patient information from OCR"""
        if not any([obj.patient_name, obj.patient_age, obj.patient_gender, obj.chief_complaints]):
            return format_html('<div style="color:#6c757d;">No patient information detected</div>')
        
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += '<h3 style="margin:0 0 15px 0;color:#333;">Patient Information (OCR)</h3>'
        html += '<table style="width:100%;border-collapse:collapse;">'
        
        if obj.patient_name:
            html += f'<tr><td style="padding:8px;color:#666;width:150px;">Name</td>'
            html += f'<td style="padding:8px;font-weight:500;">{obj.patient_name}</td></tr>'
        
        if obj.patient_age:
            html += f'<tr><td style="padding:8px;color:#666;">Age</td>'
            html += f'<td style="padding:8px;">{obj.patient_age}</td></tr>'
        
        if obj.patient_gender:
            html += f'<tr><td style="padding:8px;color:#666;">Gender</td>'
            html += f'<td style="padding:8px;">{obj.patient_gender}</td></tr>'
        
        if obj.chief_complaints:
            html += f'<tr><td style="padding:8px;color:#666;">Complaints</td>'
            html += f'<td style="padding:8px;">{obj.chief_complaints}</td></tr>'
        
        if obj.followup_date:
            html += f'<tr><td style="padding:8px;color:#666;">Follow-up</td>'
            html += f'<td style="padding:8px;">{obj.followup_date}</td></tr>'
        
        html += '</table></div>'
        return format_html(html)
    patient_info_display.short_description = 'Patient Information'
    
    def ocr_raw_text_display(self, obj):
        """Display raw OCR text"""
        if not obj.ocr_raw_text:
            return format_html('<div style="color:#6c757d;">No raw text available</div>')
        
        return format_html(
            '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
            '<h3 style="margin:0 0 10px 0;color:#333;">Raw OCR Text</h3>'
            '<pre style="background:white;padding:15px;border-radius:6px;'
            'border:1px solid #dee2e6;overflow-x:auto;font-size:12px;'
            'line-height:1.5;max-height:400px;overflow-y:auto;">{}</pre>'
            '</div>',
            obj.ocr_raw_text
        )
    ocr_raw_text_display.short_description = 'Raw OCR Text'
    
    def ocr_metadata_display(self, obj):
        """Display OCR processing metadata"""
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += '<h3 style="margin:0 0 15px 0;color:#333;">OCR Processing Metadata</h3>'
        html += '<table style="width:100%;border-collapse:collapse;">'
        
        html += f'<tr><td style="padding:8px;color:#666;width:200px;">OCR Confidence</td>'
        html += f'<td style="padding:8px;">'
        conf_colors = {'high': '#28a745', 'medium': '#ffc107', 'low': '#dc3545'}
        conf_color = conf_colors.get(obj.ocr_confidence, '#6c757d')
        html += f'<span style="background:{conf_color};color:white;'
        html += f'padding:4px 12px;border-radius:15px;font-size:12px;">'
        html += f'{obj.ocr_confidence.upper()}</span></td></tr>'
        
        html += f'<tr><td style="padding:8px;color:#666;">Created At</td>'
        html += f'<td style="padding:8px;">{obj.created_at}</td></tr>'
        
        html += f'<tr><td style="padding:8px;color:#666;">Updated At</td>'
        html += f'<td style="padding:8px;">{obj.updated_at}</td></tr>'
        
        if obj.verified_at:
            html += f'<tr><td style="padding:8px;color:#666;">Verified At</td>'
            html += f'<td style="padding:8px;">{obj.verified_at}</td></tr>'
        
        if obj.verified_by:
            html += f'<tr><td style="padding:8px;color:#666;">Verified By</td>'
            html += f'<td style="padding:8px;">{obj.verified_by}</td></tr>'
        
        html += '</table></div>'
        return format_html(html)
    ocr_metadata_display.short_description = 'OCR Metadata'
    
    def approve_prescriptions(self, request, queryset):
        """Bulk approve prescriptions"""
        from django.utils import timezone
        updated = queryset.update(
            status='approved', 
            verified_by=request.user, 
            verified_at=timezone.now()
        )
        self.message_user(request, f'{updated} prescription(s) approved successfully.')
    approve_prescriptions.short_description = '✓ Approve selected prescriptions'
    
    def reject_prescriptions(self, request, queryset):
        """Bulk reject prescriptions"""
        from django.utils import timezone
        updated = queryset.update(
            status='rejected', 
            verified_by=request.user, 
            verified_at=timezone.now()
        )
        self.message_user(request, f'{updated} prescription(s) rejected.')
    reject_prescriptions.short_description = '✗ Reject selected prescriptions'
    
    def reprocess_ocr(self, request, queryset):
        """Reprocess OCR for selected prescriptions"""
        from .advanced_ocr_handwriting import enhanced_analyze_prescription
        import os
        
        count = 0
        for verification in queryset:
            if verification.prescription_image:
                try:
                    # Get the image path
                    image_path = verification.prescription_image.path
                    if os.path.exists(image_path):
                        # Reprocess with new OCR
                        result = enhanced_analyze_prescription(image_path)
                        
                        if result['success']:
                            # Update fields
                            verification.extracted_nmc_number = result.get('nmc_number')
                            verification.doctor_name = result.get('doctor_name')
                            verification.hospital_name = result.get('hospital_name')
                            verification.department = result.get('department')
                            verification.medicine_list = result.get('medicines', [])
                            verification.patient_name = result.get('patient_info', {}).get('name')
                            verification.patient_age = result.get('patient_info', {}).get('age')
                            verification.patient_gender = result.get('patient_info', {}).get('gender')
                            verification.chief_complaints = result.get('complaints')
                            verification.followup_date = result.get('followup_date')
                            verification.ocr_confidence = result.get('confidence', 'low')
                            verification.ocr_raw_text = result.get('raw_text', '')[:2000]
                            verification.save()
                            count += 1
                except Exception as e:
                    self.message_user(request, f'Error processing #{verification.id}: {str(e)}', level='error')
        
        self.message_user(request, f'{count} prescription(s) reprocessed successfully.')
    reprocess_ocr.short_description = '🔄 Reprocess OCR'
    
    def has_add_permission(self, request):
        return True


# Register all models with the custom admin site
admin_site.register(Product, ProductAdmin)
admin_site.register(CustomUser, CustomUserAdmin)
admin_site.register(Cart, CartAdmin)
admin_site.register(CartItem, CartItemAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(userPayment, UserPaymentAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(PrescriptionVerification, PrescriptionVerificationAdmin)

# Create Delivery Boy group if it doesn't exist
def create_delivery_boy_group():
    group, created = Group.objects.get_or_create(name='Delivery Boy')
    if created:
        # Add permissions to view and change orders
        from django.contrib.contenttypes.models import ContentType
        from django.contrib.auth.models import Permission
        order_content_type = ContentType.objects.get_for_model(Order)
        view_order_permission = Permission.objects.get(content_type=order_content_type, codename='view_order')
        change_order_permission = Permission.objects.get(content_type=order_content_type, codename='change_order')
        group.permissions.add(view_order_permission, change_order_permission)
        print("Created 'Delivery Boy' group with order view and change permissions")
        
# Group creation will be handled by management command or when admin is accessed
# create_delivery_boy_group()
