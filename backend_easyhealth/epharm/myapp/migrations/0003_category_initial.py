# Generated migration to add Category model and link to Products

from django.db import migrations, models
import django.db.models.deletion


def seed_categories(apps, schema_editor):
    """Create default categories."""
    Category = apps.get_model('myapp', 'Category')
    DEFAULT_CATEGORIES = [
        {'value': 'OTC', 'label': '💊 Over-the-Counter', 'order': 1},
        {'value': 'RX', 'label': '🏥 Prescription Medicines', 'order': 2},
        {'value': 'SUP', 'label': '💪 Supplements & Vitamins', 'order': 3},
        {'value': 'WOM', 'label': "👩‍⚕️ Women's Health", 'order': 4},
        {'value': 'MEN', 'label': "👨‍⚕️ Men's Health", 'order': 5},
        {'value': 'PED', 'label': '👶 Pediatric Medicines', 'order': 6},
        {'value': 'HERB', 'label': '🌿 Herbal & Ayurvedic', 'order': 7},
        {'value': 'DIAG', 'label': '🔬 Diagnostics & Medical Devices', 'order': 8},
        {'value': 'FIRST', 'label': '🩹 First Aid', 'order': 9},
    ]
    for cat_data in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            value=cat_data['value'],
            defaults={
                'label': cat_data['label'],
                'order': cat_data['order'],
                'is_active': True,
            }
        )


def link_products(apps, schema_editor):
    """Link existing products to categories based on old category value."""
    # First we need to create a mapping by executing raw SQL since the field changed
    # This is a workaround for the migration state
    from django.db import connection
    from myapp.models import Category  # Import the actual model after it's created
    
    # Refresh categories from database
    categories = {cat.value: cat.id for cat in Category.objects.all()}
    
    Product = apps.get_model('myapp', 'Product')
    
    for product in Product.objects.all():
        # Get the old category value (stored in temp_category)
        if hasattr(product, 'temp_category') and product.temp_category:
            try:
                cat_id = categories.get(product.temp_category)
                if cat_id:
                    product.category_id = cat_id
                    product.save(update_fields=['category'])
            except Exception as e:
                print(f"Error linking product {product.id}: {e}")


def reverse_categories(apps, schema_editor):
    """Remove seeded categories."""
    Category = apps.get_model('myapp', 'Category')
    Category.objects.filter(value__in=[
        'OTC', 'RX', 'SUP', 'WOM', 'MEN', 'PED', 'HERB', 'DIAG', 'FIRST'
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_add_payment_method'),
    ]

    operations = [
        # Step 1: Add temporary field to store old category value
        migrations.AddField(
            model_name='product',
            name='temp_category',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        
        # Step 2: Create the Category model
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(max_length=50, unique=True)),
                ('label', models.CharField(max_length=100)),
                ('icon', models.CharField(blank=True, max_length=50, null=True)),
                ('color', models.CharField(default='linear-gradient(135deg, #667eea 0%, #764ba2 100%)', max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
                'ordering': ['order', 'label'],
            },
        ),
        
        # Step 3: Seed categories
        migrations.RunPython(seed_categories, reverse_categories),
        
        # Step 4: Copy old category values to temp field
        migrations.RunSQL(
            sql="UPDATE myapp_product SET temp_category = category WHERE category IS NOT NULL",
            reverse_sql="UPDATE myapp_product SET category = temp_category WHERE temp_category IS NOT NULL",
        ),
        
        # Step 5: Remove old category field
        migrations.RemoveField(
            model_name='product',
            name='category',
        ),
        
        # Step 6: Add new ForeignKey category field
        migrations.AddField(
            model_name='product',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='myapp.category'),
        ),
        
        # Step 7: Link products to categories (this requires a custom operation since we're in migration)
        migrations.RunPython(link_products, lambda apps, schema: None),
        
        # Step 8: Remove temp field
        migrations.RemoveField(
            model_name='product',
            name='temp_category',
        ),
        
        # Step 9: Fix Order status choices
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('shipped', 'Shipped'), ('delivered', 'Delivered')], default='pending', max_length=50),
        ),
    ]

