"""
Migration script for adding enhanced OCR fields to PrescriptionVerification model
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0039_fix_cartitem_cart_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='prescriptionverification',
            name='chief_complaints',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='prescriptionverification',
            name='followup_date',
            field=models.CharField(max_length=50, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='prescriptionverification',
            name='medicine_list',
            field=models.JSONField(default=list, null=True),
        ),
        migrations.AddField(
            model_name='prescriptionverification',
            name='patient_age',
            field=models.CharField(max_length=20, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='prescriptionverification',
            name='patient_gender',
            field=models.CharField(max_length=20, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='prescriptionverification',
            name='patient_name',
            field=models.CharField(max_length=100, blank=True, null=True),
        ),
    ]
