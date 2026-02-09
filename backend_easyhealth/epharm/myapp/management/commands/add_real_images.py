import os
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from myapp.models import Product
import time

class Command(BaseCommand):
    help = 'Add real photos from Lorem Picsum (free stock photos)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace existing images',
        )

    def handle(self, *args, **options):
        replace_existing = options['replace']
        
        if replace_existing:
            self.stdout.write('🔄 Replacing all images with real photos...')
        else:
            self.stdout.write('🌐 Adding real photos from internet...')
        
        products = Product.objects.all()
        total = products.count()
        success_count = 0
        failed_count = 0
        skipped_count = 0
        
        self.stdout.write(f'📸 Processing {total} products...')
        
        for idx, product in enumerate(products, 1):
            try:
                # Skip if has image and not replacing
                if not replace_existing and product.image and str(product.image) != '':
                    self.stdout.write(f'⏭️  [{idx}/{total}] Skipping: {product.name}')
                    skipped_count += 1
                    continue
                
                self.stdout.write(f'🔄 [{idx}/{total}] Downloading: {product.name}')
                
                # Use Lorem Picsum with seed based on product ID for consistent images
                # Different seeds give different images, but same seed = same image
                image_url = f"https://picsum.photos/seed/{product.id}/400/400"
                
                try:
                    response = requests.get(image_url, timeout=15, allow_redirects=True)
                    if response.status_code == 200 and len(response.content) > 1000:
                        # Determine extension from content type
                        content_type = response.headers.get('content-type', '')
                        if 'png' in content_type:
                            ext = 'png'
                        else:
                            ext = 'jpg'
                        
                        filename = f"{product.id}_{product.name.replace(' ', '_').replace('/', '_')[:30]}.{ext}"
                        
                        # Delete old image if exists
                        if product.image:
                            try:
                                product.image.delete(save=False)
                            except:
                                pass
                        
                        product.image.save(filename, ContentFile(response.content), save=True)
                        success_count += 1
                        self.stdout.write(self.style.SUCCESS(f'   ✅ Downloaded: {product.name} ({len(response.content)} bytes)'))
                    else:
                        failed_count += 1
                        self.stdout.write(self.style.ERROR(f'   ❌ Failed: HTTP {response.status_code}'))
                except Exception as e:
                    failed_count += 1
                    self.stdout.write(self.style.ERROR(f'   ❌ Error: {str(e)}'))
                
                # Small delay
                time.sleep(0.2)
                
            except Exception as e:
                failed_count += 1
                self.stdout.write(self.style.ERROR(f'   ❌ Error for {product.name}: {str(e)}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 REAL IMAGES ADDED!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Success: {success_count}')
        self.stdout.write(f'⏭️  Skipped: {skipped_count}')
        self.stdout.write(f'❌ Failed: {failed_count}')
        self.stdout.write(f'📊 Total: {total}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('🌐 Images from Lorem Picsum (free stock photos)')
        self.stdout.write('   Each product gets a unique, consistent image!')
