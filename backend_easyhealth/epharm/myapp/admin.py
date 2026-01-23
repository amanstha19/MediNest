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
    readonly_fields = ('product', 'quantity', 'prescription_file_tag')
    can_delete = False
    extra = 0
    
    def prescription_file_tag(self, obj):
        if obj.prescription_file:
            return format_html(
                '<a href="{}" target="_blank" style="color: blue;">View</a>',
                obj.prescription_file.url
            )
        return '-'
    
    def has_add_permission(self, request, obj=None):
        return False


class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'prescription_tag', 'payment_status_display', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email', 'id')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CartItemInline]
    list_editable = ('status',)
    
    def prescription_tag(self, obj):
        if obj.prescription:
            return format_html(
                '<a href="{}" target="_blank" style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;">View Prescription</a>',
                obj.prescription.url
            )
        return format_html('<span style="color: #999;">No Prescription</span>')
    prescription_tag.short_description = 'Prescription'
    
    def payment_status_display(self, obj):
        try:
            payment = userPayment.objects.filter(order=obj).first()
            if payment:
                if payment.status == 'PAID':
                    return format_html('<span style="color: green; font-weight: bold;">PAID</span>')
                elif payment.status == 'PENDING':
                    return format_html('<span style="color: orange;">PENDING</span>')
                elif payment.status == 'FAILED':
                    return format_html('<span style="color: red;">FAILED</span>')
                elif payment.status == 'REFUNDED':
                    return format_html('<span style="color: purple;">REFUNDED</span>')
                else:
                    return format_html('<span style="color: gray;">{}</span>', payment.status)
        except:
            pass
        return format_html('<span style="color: gray;">No Payment</span>')
    payment_status_display.short_description = 'Payment'


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_uuid', 'get_user', 'get_order', 'amount', 'status', 'transaction_code', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('transaction_uuid', 'user__username', 'transaction_code')
    readonly_fields = ('transaction_uuid', 'created_at', 'updated_at')
    list_editable = ('status',)
    
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


# Register all models
admin_site.register(Product, ProductAdmin)
admin_site.register(CustomUser, CustomUserAdmin)
admin_site.register(Cart, CartAdmin)
admin_site.register(CartItem, CartItemAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(userPayment, UserPaymentAdmin)

