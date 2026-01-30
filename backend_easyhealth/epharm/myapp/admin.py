from django.contrib import admin
from django.contrib.admin import AdminSite
from django.template.response import TemplateResponse
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.utils import timezone
from django.urls import path
from django.http import HttpResponse
from datetime import timedelta
from unfold.sites import UnfoldAdminSite
from .models import Product, CustomUser, Cart, CartItem, Order, userPayment


class MediNestAdminSite(UnfoldAdminSite):
    """Custom admin site with dashboard and charts"""
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        """Custom dashboard view with charts and statistics"""
        from datetime import timedelta
        
        today = timezone.now()
        
        total_products = Product.objects.count()
        total_users = CustomUser.objects.count()
        total_orders = Order.objects.count()
        total_revenue = userPayment.objects.filter(status='PAID').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        pending_orders = Order.objects.filter(status='pending').count()
        shipped_orders = Order.objects.filter(status='shipped').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        
        recent_orders = Order.objects.all().order_by('-created_at')[:10]
        low_stock_products = Product.objects.filter(stock__lt=10).exclude(stock=0)[:5]
        
        sales_data = []
        labels = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999)
            
            daily_sales = userPayment.objects.filter(
                status='PAID',
                created_at__gte=day_start,
                created_at__lte=day_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            sales_data.append(float(daily_sales))
            labels.append(day.strftime('%b %d'))
        
        html_content = '''<!DOCTYPE html>
<html>
<head>
    <title>MediNest Dashboard</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .stat-card.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .stat-card.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-card.blue { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { opacity: 0.9; font-size: 14px; }
        .chart-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .chart-container { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .table-container { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; background: #f8f9fa; }
        td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        h1 { margin-bottom: 30px; color: #333; }
        h3 { margin-bottom: 15px; color: #333; }
        .status-pending { background: #fff3cd; color: #856404; padding: 4px 12px; border-radius: 4px; }
        .status-shipped { background: #cce5ff; color: #004085; padding: 4px 12px; border-radius: 4px; }
        .status-delivered { background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>MediNest Dashboard</h1>
    
    <div class="dashboard-grid">
        <div class="stat-card">
            <div class="stat-value">''' + str(total_products) + '''</div>
            <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card green">
            <div class="stat-value">''' + str(total_users) + '''</div>
            <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card orange">
            <div class="stat-value">''' + str(total_orders) + '''</div>
            <div class="stat-label">Total Orders</div>
        </div>
        <div class="stat-card blue">
            <div class="stat-value">$''' + f"{total_revenue:.2f}" + '''</div>
            <div class="stat-label">Total Revenue</div>
        </div>
    </div>
    
    <div class="dashboard-grid">
        <div class="stat-card" style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%)">
            <div class="stat-value">''' + str(pending_orders) + '''</div>
            <div class="stat-label">Pending Orders</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)">
            <div class="stat-value">''' + str(shipped_orders) + '''</div>
            <div class="stat-label">Shipped Orders</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
            <div class="stat-value">''' + str(delivered_orders) + '''</div>
            <div class="stat-label">Delivered Orders</div>
        </div>
    </div>
    
    <div class="chart-row">
        <div class="chart-container">
            <h3>Sales (Last 7 Days)</h3>
            <canvas id="salesChart" height="200"></canvas>
        </div>
        <div class="chart-container">
            <h3>Order Status</h3>
            <canvas id="orderStatusChart" height="200"></canvas>
        </div>
    </div>
    
    <div class="table-container">
        <h3>Recent Orders</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
'''
        
        for order in recent_orders:
            html_content += '''                <tr>
                    <td>#''' + str(order.id) + '''</td>
                    <td>''' + str(order.user.username) + '''</td>
                    <td>$''' + str(order.total_price) + '''</td>
                    <td><span class="status-''' + str(order.status) + '''">''' + str(order.status.title()) + '''</span></td>
                </tr>
'''
        
        if not recent_orders:
            html_content += '''                <tr>
                    <td colspan="4" style="text-align: center;">No orders yet</td>
                </tr>
'''
        
        html_content += '''            </tbody>
        </table>
    </div>
    
    <div class="table-container">
        <h3>Low Stock Products</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                </tr>
            </thead>
            <tbody>
'''
        
        for product in low_stock_products:
            html_content += '''                <tr>
                    <td>''' + str(product.name) + '''</td>
                    <td>''' + str(product.category) + '''</td>
                    <td style="color: orange; font-weight: bold;">''' + str(product.stock) + '''</td>
                </tr>
'''
        
        if not low_stock_products:
            html_content += '''                <tr>
                    <td colspan="3" style="text-align: center;">All products well stocked!</td>
                </tr>
'''
        
        html_content += '''            </tbody>
        </table>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const salesCtx = document.getElementById("salesChart").getContext("2d");
            new Chart(salesCtx, {
                type: "line",
                data: {
                    labels: ''' + str(labels) + ''',
                    datasets: [{
                        label: "Sales ($)",
                        data: ''' + str(sales_data) + ''',
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: function(value) { return "$" + value; } } }
                    }
                }
            });
            
            const statusCtx = document.getElementById("orderStatusChart").getContext("2d");
            new Chart(statusCtx, {
                type: "doughnut",
                data: {
                    labels: ["Pending", "Shipped", "Delivered"],
                    datasets: [{
                        data: [''' + str(pending_orders) + ''', ''' + str(shipped_orders) + ''', ''' + str(delivered_orders) + '''],
                        backgroundColor: ["#f5af19", "#36d1dc", "#11998e"]
                    }]
                },
                options: { responsive: true, plugins: { legend: { position: "bottom" } } }
            });
        });
    </script>
</body>
</html>
'''
        
        return HttpResponse(html_content)


# Create instance
admin_site = MediNestAdminSite(name='admin')


class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'generic_name', 'price', 'category', 'stock', 'stock_status', 'prescription_required')
    list_editable = ('stock',)
    search_fields = ('name', 'generic_name')
    list_filter = ('category', 'prescription_required')
    
    def stock_status(self, obj):
        if obj.stock == 0:
            return format_html('<span style="color: red; font-weight: bold;">Out of Stock</span>')
        elif obj.stock < 10:
            return format_html('<span style="color: orange; font-weight: bold;">Low Stock ({})</span>', obj.stock)
        return format_html('<span style="color: green;">In Stock ({})</span>', obj.stock)
    stock_status.short_description = 'Stock Status'


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'city', 'phone')
    search_fields = ('username', 'email', 'first_name')


class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'item_count')
    
    def item_count(self, obj):
        return obj.cart_items.count()
    item_count.short_description = 'Items'


class CartItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'cart_user', 'prescription_file_tag')
    search_fields = ('product__name',)
    list_filter = ('product__category',)
    
    def cart_user(self, obj):
        return obj.cart.user.username
    cart_user.short_description = 'Cart User'
    
    def prescription_file_tag(self, obj):
        if obj.prescription_file:
            return format_html(
                '<a href="{}" target="_blank" style="color: blue;">View Prescription</a>',
                obj.prescription_file.url
            )
        return '-'
    prescription_file_tag.short_description = 'Prescription'


class CartItemInline(admin.TabularInline):
    model = CartItem
    readonly_fields = ('product', 'quantity', 'line_total', 'prescription_file_tag')
    can_delete = False
    extra = 0
    ordering = ('id',)
    
    def line_total(self, obj):
        if obj.product and obj.quantity:
            return format_html(
                '<span style="font-weight: bold;">Rs. {}</span>',
                float(obj.product.price) * obj.quantity
            )
        return '-'
    line_total.short_description = 'Subtotal'
    
    def prescription_file_tag(self, obj):
        if obj.prescription_file:
            return format_html(
                '<a href="{}" target="_blank" style="color: blue;">View</a>',
                obj.prescription_file.url
            )
        return '-'
    prescription_file_tag.short_description = 'Prescription'
    
    def has_add_permission(self, request, obj=None):
        return False


class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'order_id_link', 'user_link', 'products_list', 
        'total_price', 'status', 'transaction_info', 
        'prescription_tag', 'payment_method_display', 'created_at'
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('id', 'user__username', 'user__email', 'user__phone', 'address')
    readonly_fields = ('created_at', 'updated_at', 'order_summary', 'products_display', 'payment_details')
    inlines = [CartItemInline]
    list_editable = ('status',)
    list_per_page = 20
    
    def order_id_link(self, obj):
        return format_html(
            '<a href="/admin/myapp/order/{}/change/" style="font-weight: bold; color: #2196F3;">#{}</a>',
            obj.id, obj.id
        )
    order_id_link.short_description = 'Order ID'
    order_id_link.admin_order_field = 'id'
    
    def user_link(self, obj):
        if obj.user:
            return format_html(
                '<a href="/admin/myapp/customuser/{}/change/">{}</a><br>'
                '<small style="color: #666;">{}</small>',
                obj.user.id,
                obj.user.get_full_name() or obj.user.username,
                obj.user.email
            )
        return '-'
    user_link.short_description = 'Customer'
    user_link.admin_order_field = 'user__username'
    
    def products_list(self, obj):
        """Display all products in the order as a list in the admin list view"""
        items = obj.cartitem_set.all()
        if items:
            html = '<div style="max-width: 350px;">'
            for item in items:
                img_html = ''
                if item.product and item.product.image:
                    img_html = format_html(
                        '<img src="{}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 3px; vertical-align: middle; margin-right: 5px;" />',
                        item.product.image.url
                    )
                product_name = item.product.name if item.product else 'Unknown Product'
                quantity = item.quantity
                price = float(item.product.price) * item.quantity if item.product else 0
                html += format_html(
                    '<div style="margin-bottom: 4px; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">'
                    '{}{} x {} - Rs. {}'
                    '</div>',
                    img_html,
                    product_name,
                    quantity,
                    price
                )
            html += '</div>'
            return format_html(html)
        return format_html('<span style="color: gray;">No products</span>')
    products_list.short_description = 'Products Purchased'
    
    def order_summary(self, obj):
        """Display order summary in detail view"""
        items = obj.cartitem_set.all()
        html = '<div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">'
        html += f'<h4>Order #{obj.id} Summary</h4>'
        html += '<table style="width: 100%; border-collapse: collapse;">'
        html += '<tr><td style="padding: 8px;"><strong>Customer:</strong></td>'
        html += f'<td>{obj.user.get_full_name() or obj.user.username} ({obj.user.email})</td></tr>'
        html += '<tr><td style="padding: 8px;"><strong>Total Items:</strong></td>'
        html += f'<td>{items.count()}</td></tr>'
        html += '<tr><td style="padding: 8px;"><strong>Total Price:</strong></td>'
        html += f'<td>Rs. {obj.total_price}</td></tr>'
        html += '<tr><td style="padding: 8px;"><strong>Status:</strong></td>'
        html += f'<td>{obj.status.upper()}</td></tr>'
        html += '<tr><td style="padding: 8px;"><strong>Address:</strong></td>'
        html += f'<td>{obj.address}</td></tr>'
        html += '</table></div>'
        return format_html(html)
    order_summary.short_description = 'Order Summary'
    
    def products_display(self, obj):
        """Display all products in the order with detailed information"""
        items = obj.cartitem_set.all()
        html = '<div style="background: #fff; padding: 15px;">'
        html += '<h4>Products in Order</h4>'
        if items:
            html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">'
            html += '<thead><tr style="background: #e3f2fd;">'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">#</th>'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">Product</th>'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">Image</th>'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">Category</th>'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">Qty</th>'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">Unit Price</th>'
            html += '<th style="padding: 10px; border: 1px solid #ddd;">Subtotal</th>'
            html += '</tr></thead><tbody>'
            for idx, item in enumerate(items, 1):
                img_html = ''
                if item.product and item.product.image:
                    img_html = format_html(
                        '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                        item.product.image.url
                    )
                product_name = item.product.name if item.product else 'Unknown Product'
                generic_name = item.product.generic_name if item.product else ''
                category = item.product.get_category_display() if item.product else '-'
                quantity = item.quantity
                unit_price = item.product.price if item.product else 0
                subtotal = float(unit_price) * quantity
                
                html += '<tr>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #666;">{idx}</td>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd;">{product_name}<br><small style="color: #666;">{generic_name}</small></td>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">{img_html}</td>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd;">{category}</td>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">{quantity}</td>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd;">Rs. {unit_price}</td>'
                html += f'<td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: green;">Rs. {subtotal}</td>'
                html += '</tr>'
            html += '</tbody></table>'
            html += f'<p style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 8px;">Total: Rs. {obj.total_price}</p>'
        else:
            html += '<p>No items in this order</p>'
        html += '</div>'
        return format_html(html)
    products_display.short_description = 'All Products Details'
    
    def payment_details(self, obj):
        """Display payment details"""
        try:
            payment = userPayment.objects.filter(order=obj).first()
            if payment:
                html = '<div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">'
                html += '<h4>Payment Information</h4>'
                html += '<table style="width: 100%; border-collapse: collapse;">'
                html += f'<tr><td style="padding: 8px;"><strong>Transaction ID:</strong></td>'
                html += f'<td><code style="background: #fff; padding: 4px 8px; border-radius: 4px;">{payment.transaction_uuid}</code></td></tr>'
                html += f'<tr><td style="padding: 8px;"><strong>Amount:</strong></td>'
                html += f'<td>Rs. {payment.amount}</td></tr>'
                html += f'<tr><td style="padding: 8px;"><strong>Tax:</strong></td>'
                html += f'<td>Rs. {payment.tax_amount}</td></tr>'
                html += f'<tr><td style="padding: 8px;"><strong>Total Amount:</strong></td>'
                html += f'<td style="font-weight: bold; color: green;">Rs. {payment.total_amount}</td></tr>'
                html += f'<tr><td style="padding: 8px;"><strong>Status:</strong></td>'
                status_color = {'PAID': 'green', 'PENDING': 'orange', 'FAILED': 'red', 'REFUNDED': 'purple'}.get(payment.status, 'gray')
                html += f'<td><span style="color: {status_color}; font-weight: bold;">{payment.status}</span></td></tr>'
                html += f'<tr><td style="padding: 8px;"><strong>Payment Method:</strong></td>'
                html += f'<td>{payment.get_payment_method_display()}</td></tr>'
                if payment.transaction_code:
                    html += f'<tr><td style="padding: 8px;"><strong>Transaction Code:</strong></td>'
                    html += f'<td><code>{payment.transaction_code}</code></td></tr>'
                html += f'<tr><td style="padding: 8px;"><strong>Created:</strong></td>'
                html += f'<td>{payment.created_at}</td></tr>'
                html += '</table></div>'
                return format_html(html)
        except Exception:
            pass
        return format_html('<span style="color: gray;">No payment information available</span>')
    payment_details.short_description = 'Payment Details'
    
    def transaction_info(self, obj):
        """Display transaction ID in list view"""
        try:
            payment = userPayment.objects.filter(order=obj).first()
            if payment:
                return format_html(
                    '<div style="font-size: 12px;">'
                    '<code style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px;">{}</code><br>'
                    '<span style="color: green; font-weight: bold;">{}</span>'
                    '</div>',
                    payment.transaction_uuid[:12] + '...' if len(payment.transaction_uuid) > 12 else payment.transaction_uuid,
                    payment.status
                )
        except:
            pass
        return format_html('<span style="color: gray;">No transaction</span>')
    transaction_info.short_description = 'Transaction'
    
    def prescription_tag(self, obj):
        if obj.prescription:
            return format_html(
                '<a href="{}" target="_blank" style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;">View Rx</a>',
                obj.prescription.url
            )
        return format_html('<span style="color: #999;">No Rx</span>')
    prescription_tag.short_description = 'Prescription'
    
    def payment_method_display(self, obj):
        try:
            payment = userPayment.objects.filter(order=obj).first()
            if payment:
                method_colors = {'ONLINE': '#2196F3', 'CASH_ON_DELIVERY': '#FF9800', 'BANK_TRANSFER': '#9C27B0'}
                return format_html(
                    '<span style="color: {}; font-weight: bold;">{}</span>',
                    method_colors.get(payment.payment_method, '#666'),
                    payment.get_payment_method_display()
                )
        except:
            pass
        return format_html('<span style="color: gray;">-</span>')
    payment_method_display.short_description = 'Method'


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_uuid', 'get_user', 'get_order', 'amount', 'status', 'payment_method', 'transaction_code', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('transaction_uuid', 'user__username', 'transaction_code')
    readonly_fields = ('transaction_uuid', 'created_at', 'updated_at')
    list_editable = ('status', 'payment_method')
    
    def get_user(self, obj):
        if obj.user:
            return format_html(
                '<a href="/admin/myapp/customuser/{}/change/">{}</a>',
                obj.user.id,
                obj.user.username
            )
        return "No user"
    get_user.short_description = 'User'
    get_user.admin_order_field = 'user__username'
    
    def get_order(self, obj):
        if obj.order:
            return format_html(
                '<a href="/admin/myapp/order/{}/change/">Order #{}</a>',
                obj.order.id,
                obj.order.id
            )
        return "No order"
    get_order.short_description = 'Order'
    get_order.admin_order_field = 'order__id'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ('transaction_uuid', 'created_at', 'updated_at')
        return ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        return False
    
    def save_model(self, request, obj, form, change):
        """
        Override save_model to:
        1. Auto-set status to PAID when payment_method is 'ONLINE'
        2. Sync order status when payment status changes
        """
        # Get the original payment object if this is an update
        if change:
            try:
                original = userPayment.objects.get(pk=obj.pk)
                
                # Check if payment_method changed to ONLINE
                if obj.payment_method == 'ONLINE' and original.payment_method != 'ONLINE':
                    obj.status = 'PAID'
                    self.message_user(request, f"Payment status automatically set to PAID for online payment.")
                
                # Sync order status when payment status changes
                if obj.status != original.status and obj.order:
                    if obj.status == 'PAID':
                        obj.order.status = 'paid'
                        self.message_user(request, f"Order #{obj.order.id} status updated to 'paid'.")
                    elif obj.status == 'FAILED' and obj.order.status == 'paid':
                        obj.order.status = 'pending'
                        self.message_user(request, f"Order #{obj.order.id} status reverted to 'pending' due to payment failure.")
                    elif obj.status == 'REFUNDED' and obj.order.status == 'paid':
                        obj.order.status = 'refunded'
                        self.message_user(request, f"Order #{obj.order.id} status updated to 'refunded'.")
                    obj.order.save()
                    
            except userPayment.DoesNotExist:
                pass
        
        # For new objects, if payment_method is ONLINE, set status to PAID
        if not change and obj.payment_method == 'ONLINE':
            obj.status = 'PAID'
            self.message_user(request, f"New online payment status automatically set to PAID.")
        
        super().save_model(request, obj, form, change)


# Register all models
admin_site.register(Product, ProductAdmin)
admin_site.register(CustomUser, CustomUserAdmin)
admin_site.register(Cart, CartAdmin)
admin_site.register(CartItem, CartItemAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(userPayment, UserPaymentAdmin)

