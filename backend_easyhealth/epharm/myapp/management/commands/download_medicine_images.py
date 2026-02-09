import os
import requests
import time
from django.core.management.base import BaseCommand
from django.core.files import File
from myapp.models import Product
from PIL import Image, ImageDraw, ImageFont
import io

class Command(BaseCommand):
    help = 'Download medicine images from multiple sources or create professional ones'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            default='all',
            choices=['all', 'unsplash', 'pexels', 'generate'],
            help='Image source to use'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=70,
            help='Number of products to process'
        )

    def handle(self, *args, **options):
        source = options['source']
        limit = options['limit']
        
        products = Product.objects.all().order_by('id')[:limit]
        total = products.count()
        
        self.stdout.write(f'🎯 Processing {total} products from {source}')
        self.stdout.write('=' * 60)
        
        success = 0
        failed = 0
        
        for idx, product in enumerate(products, 1):
            self.stdout.write(f'\n[{idx}/{total}] {product.name}')
            
            try:
                if source in ['all', 'generate']:
                    # Create professional generated image
                    image = self.create_medicine_image(product)
                    self.save_image(product, image, 'generated')
                    success += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Generated'))
                else:
                    self.stdout.write(self.style.WARNING(f'  ⚠️  Skipped'))
                    failed += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Error: {str(e)[:50]}'))
                failed += 1
            
            time.sleep(0.1)  # Small delay
        
        self.stdout.write('')
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS(f'🎉 Complete! ✅ {success} | ❌ {failed}'))
        
    def create_medicine_image(self, product):
        """Create a professional medicine product image"""
        # Create image with category-based color
        colors = {
            'OTC': '#4CAF50',      # Green
            'RX': '#F44336',       # Red
            'SUP': '#2196F3',      # Blue
            'WOM': '#E91E63',      # Pink
            'MEN': '#3F51B5',      # Indigo
            'PED': '#FF9800',      # Orange
            'HERB': '#8BC34A',     # Light Green
            'DIAG': '#9C27B0',     # Purple
            'FIRST': '#00BCD4',    # Cyan
        }
        
        # Get category code
        category_name = product.category.name if product.category else 'OTC'
        category_code = category_name[:4].upper() if category_name else 'OTC'
        color = colors.get(category_code, '#607D8B')
        
        # Create image
        img = Image.new('RGB', (400, 400), color)
        draw = ImageDraw.Draw(img)
        
        # Add white box in center
        margin = 20
        draw.rectangle([margin, margin, 400-margin, 400-margin], fill='white')
        
        # Try to load font
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
            font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        except:
            font_large = ImageFont.load_default()
            font_medium = font_large
            font_small = font_large
        
        # Draw product name
        name = product.name[:25]  # Limit length
        draw.text((40, 60), name, fill='black', font=font_large)
        
        # Draw generic name
        if product.generic_name:
            generic = f"({product.generic_name[:30]})"
            draw.text((40, 100), generic, fill='gray', font=font_small)
        
        # Draw price
        price_text = f"Rs. {product.price}"
        draw.text((40, 160), price_text, fill=color, font=font_medium)
        
        # Draw stock
        stock_text = f"In Stock: {product.stock}"
        draw.text((40, 200), stock_text, fill='green' if product.stock > 0 else 'red', font=font_small)
        
        # Draw prescription badge
        if product.prescription_required:
            badge_color = '#F44336'
            draw.rounded_rectangle([40, 260, 200, 300], radius=10, fill=badge_color)
            draw.text((55, 270), "⚕️ PRESCRIPTION", fill='white', font=font_small)
        
        # Draw category badge
        cat_color = color
        draw.rounded_rectangle([220, 260, 360, 300], radius=10, fill=cat_color)
        draw.text((235, 270), category_code, fill='white', font=font_small)
        
        # Add medicine icon
        draw.text((320, 60), "💊", font=font_large)
        
        return img
    
    def save_image(self, product, image, source):
        """Save image to product"""
        # Delete old image
        if product.image:
            try:
                product.image.delete(save=False)
            except:
                pass
        
        # Save new image
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        
        filename = f"{product.id}_{product.name.replace(' ', '_')}.png"
        product.image.save(filename, File(buffer), save=True)
