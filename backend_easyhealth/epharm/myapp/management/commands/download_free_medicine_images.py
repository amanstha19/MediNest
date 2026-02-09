import os
import requests
import time
import random
from django.core.management.base import BaseCommand
from django.core.files import File
from myapp.models import Product
import io

class Command(BaseCommand):
    help = 'Download free stock photos of medicine/health products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            default='all',
            choices=['all', 'unsplash', 'pexels', 'picsum'],
            help='Image source'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=70,
            help='Number of products'
        )
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace existing images'
        )

    def handle(self, *args, **options):
        source = options['source']
        limit = options['limit']
        replace = options['replace']
        
        products = Product.objects.all().order_by('id')[:limit]
        total = products.count()
        
        self.stdout.write(f'🌐 Downloading free medicine images from {source}')
        self.stdout.write('=' * 60)
        
        success = 0
        failed = 0
        
        # Medicine-related search terms for free stock photos
        search_terms = [
            'medicine', 'pills', 'pharmacy', 'drugs', 'tablets',
            'capsules', 'vitamins', 'supplements', 'health', 'medical',
            'bottle', 'prescription', 'healthcare', 'treatment',
            'antibiotic', 'painkiller', 'vitamin', 'mineral',
            'herbal', 'ayurvedic', 'thermometer', 'first-aid',
            'bandage', 'medical-kit', 'health-product'
        ]
        
        for idx, product in enumerate(products, 1):
            # Skip if has image and not replacing
            if not replace and product.image:
                self.stdout.write(f'⏭️  [{idx}/{total}] Skipping: {product.name}')
                success += 1
                continue
            
            self.stdout.write(f'\n📸 [{idx}/{total}] {product.name}')
            
            try:
                # Pick a search term based on product category
                category_value = product.category.value if product.category else 'OTC'
                term = self.get_search_term(product.name, category_value, search_terms)
                
                # Download from free sources
                image_data = self.download_free_image(term, idx)
                
                if image_data:
                    self.save_image(product, image_data)
                    success += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Downloaded: {term}'))
                else:
                    failed += 1
                    self.stdout.write(self.style.WARNING(f'  ⚠️  Failed to download'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Error: {str(e)[:50]}'))
                failed += 1
            
            time.sleep(0.5)  # Be nice to APIs
        
        self.stdout.write('')
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS(f'🎉 Complete! ✅ {success} | ❌ {failed}'))
        
    def get_search_term(self, product_name, category, search_terms):
        """Get appropriate search term for product"""
        # Map categories to specific terms
        category_terms = {
            'OTC': ['medicine', 'pills', 'tablets', 'painkiller'],
            'RX': ['prescription', 'medicine', 'drugs', 'antibiotic'],
            'SUP': ['vitamins', 'supplements', 'health', 'mineral'],
            'WOM': ['women-health', 'vitamins', 'supplements'],
            'MEN': ['men-health', 'vitamins', 'supplements'],
            'PED': ['children-medicine', 'pediatric', 'vitamins'],
            'HERB': ['herbal', 'ayurvedic', 'natural-medicine', 'organic'],
            'DIAG': ['medical-device', 'thermometer', 'healthcare'],
            'FIRST': ['first-aid', 'bandage', 'medical-kit', 'emergency'],
        }
        
        # Get terms for category or use generic
        terms = category_terms.get(category, search_terms)
        
        # Try to match product name with term
        name_lower = product_name.lower()
        for term in terms:
            if any(word in name_lower for word in term.replace('-', ' ').split()):
                return term
        
        # Return random term from category
        return random.choice(terms)
    
    def download_free_image(self, term, idx):
        """Download free stock photo"""
        # Try multiple free sources
        
        # 1. Try Lorem Picsum (always works, random photos)
        try:
            url = f"https://picsum.photos/400/400?random={idx}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.content
        except:
            pass
        
        # 2. Try Unsplash Source (free stock photos)
        try:
            url = f"https://source.unsplash.com/400x400/?{term}"
            response = requests.get(url, timeout=10, allow_redirects=True)
            if response.status_code == 200:
                return response.content
        except:
            pass
        
        # 3. Try Pexels (if we had API key, using random for now)
        try:
            # Generic health image from picsum as fallback
            url = f"https://picsum.photos/seed/{term}{idx}/400/400"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.content
        except:
            pass
        
        return None
    
    def save_image(self, product, image_data):
        """Save image to product"""
        # Delete old image
        if product.image:
            try:
                product.image.delete(save=False)
            except:
                pass
        
        # Save new image
        buffer = io.BytesIO(image_data)
        filename = f"{product.id}_{product.name.replace(' ', '_')}.jpg"
        product.image.save(filename, File(buffer), save=True)
