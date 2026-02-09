import os
from django.core.management.base import BaseCommand
from django.core.files import File
from myapp.models import Product

class Command(BaseCommand):
    help = 'Upload manually downloaded medicine images'

    def add_arguments(self, parser):
        parser.add_argument(
            'folder',
            type=str,
            help='Path to folder containing downloaded images',
        )

    def handle(self, *args, **options):
        folder = options['folder']
        
        if not os.path.exists(folder):
            self.stdout.write(self.style.ERROR(f'❌ Folder not found: {folder}'))
            return
        
        # Get all products
        products = Product.objects.all().order_by('id')
        total = products.count()
        uploaded = 0
        
        self.stdout.write(f'📁 Reading images from: {folder}')
        self.stdout.write(f'📊 Found {total} products in database')
        self.stdout.write('')
        
        for product in products:
            # Try different filename formats
            possible_names = [
                f"{product.id}.jpg",
                f"{product.id}.jpeg",
                f"{product.id}.png",
                f"{product.name}.jpg",
                f"{product.name}.jpeg",
                f"{product.name}.png",
                product.name.replace(' ', '_') + '.jpg',
                product.name.replace(' ', '_') + '.jpeg',
                product.name.replace(' ', '_') + '.png',
            ]
            
            found = False
            for filename in possible_names:
                filepath = os.path.join(folder, filename)
                if os.path.exists(filepath):
                    try:
                        # Delete old image if exists
                        if product.image:
                            try:
                                product.image.delete(save=False)
                            except:
                                pass
                        
                        # Save new image
                        with open(filepath, 'rb') as f:
                            product.image.save(
                                f"{product.id}_{product.name.replace(' ', '_')}.jpg",
                                File(f),
                                save=True
                            )
                        
                        self.stdout.write(self.style.SUCCESS(f'✅ {product.id}: {product.name}'))
                        uploaded += 1
                        found = True
                        break
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'❌ {product.id}: Error - {str(e)[:50]}'))
            
            if not found:
                self.stdout.write(self.style.WARNING(f'⚠️  {product.id}: {product.name} - No image found'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 UPLOAD COMPLETE!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Uploaded: {uploaded}/{total}')
        self.stdout.write('=' * 50)
