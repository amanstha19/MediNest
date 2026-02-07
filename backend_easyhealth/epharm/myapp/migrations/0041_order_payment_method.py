# Generated migration for Order.payment_method field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0040_enhanced_ocr_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                choices=[('ONLINE', 'Online Payment'), ('CASH_ON_DELIVERY', 'Cash on Delivery')],
                default='CASH_ON_DELIVERY',
                max_length=50
            ),
        ),
    ]

