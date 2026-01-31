# Generated migration to seed categories
from django.db import migrations


def seed_categories(apps, schema_editor):
    
    Category = apps.get_model('myapp', 'Category')
    
    categories = [
        {'value': 'OTC', 'label': 'Over-the-Counter', 'icon': 'Pill', 'color': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 'description': 'Medicines available without prescription', 'order': 1},
        {'value': 'RX', 'label': 'Prescription Medicines', 'icon': 'Syringe', 'color': 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', 'description': 'Prescription required medicines', 'order': 2},
        {'value': 'SUP', 'label': 'Vitamins & Supplements', 'icon': 'FlaskConical', 'color': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 'description': 'Daily nutrition and supplements', 'order': 3},
        {'value': 'WOM', 'label': "Women's Health", 'icon': 'HeartPulse', 'color': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 'description': "Women's health products", 'order': 4},
        {'value': 'MEN', 'label': "Men's Health", 'icon': 'Activity', 'color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'description': "Men's health products", 'order': 5},
        {'value': 'PED', 'label': 'Pediatric Medicines', 'icon': 'Baby', 'color': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 'description': 'Baby medicines & products', 'order': 6},
        {'value': 'HERB', 'label': 'Herbal & Ayurvedic', 'icon': 'Leaf', 'color': 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', 'description': 'Natural remedies and ayurvedic products', 'order': 7},
        {'value': 'DIAG', 'label': 'Medical Devices', 'icon': 'Monitor', 'color': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'description': 'BP monitors, glucometers, and medical devices', 'order': 8},
        {'value': 'FIRST', 'label': 'First Aid', 'icon': 'SquarePlus', 'color': 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', 'description': 'Bandages, antiseptics, and first aid supplies', 'order': 9},
    ]
    
    for cat in categories:
        Category.objects.update_or_create(
            value=cat['value'],
            defaults={
                'label': cat['label'],
                'icon': cat['icon'],
                'color': cat['color'],
                'description': cat['description'],
                'order': cat['order'],
                'is_active': True
            }
        )


def reverse_categories(apps, schema_editor):
    """Remove all seeded categories"""
    Category = apps.get_model('myapp', 'Category')
    Category.objects.filter(value__in=['OTC', 'RX', 'SUP', 'WOM', 'MEN', 'PED', 'HERB', 'DIAG', 'FIRST']).delete()


class Migration(migrations.Migration):
    
    dependencies = [
        ('myapp', '0003_category_initial'),
    ]
    operations = [
        migrations.RunPython(seed_categories, reverse_categories),
    ]
