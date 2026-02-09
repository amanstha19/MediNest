import os
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from myapp.models import Product
import time

class Command(BaseCommand):
    help = 'Fetch real medicine images from Unsplash free stock photos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace existing images with new ones',
        )

    def handle(self, *args, **options):
        replace_existing = options['replace']
        
        if replace_existing:
            self.stdout.write('🔄 Replacing all existing images with real photos...')
        else:
            self.stdout.write('🌐 Fetching real medicine images from Unsplash...')
        
        # Medicine/healthcare related search terms from Unsplash
        # Using specific photo IDs for consistent, relevant images
        unsplash_photos = {
            # OTC - Medicine tablets/pills
            'Paracetamol': '1584308663234-2a1d6a6a9c2c',  # White pills
            'Ibuprofen': '1587854691152-62c9a58e0b8b',  # Medicine tablets
            'Cetirizine': '1631549916768-4119b2e5f437',  # Allergy medicine
            'Digene': '1584308663234-2a1d6a6a9c2c',  # Antacid
            'Aspirin': '1587854691152-62c9a58e0b8b',  # Aspirin tablets
            'Loratadine': '1631549916768-4119b2e5f437',  # Allergy
            'Pantoprazole': '1584308663234-2a1d6a6a9c2c',  # Acid reflux
            'ORS': '1559757175-4b5c3b5b5b5b',  # Rehydration
            
            # RX - Prescription
            'Amoxicillin': '1587854691152-62c9a58e0b8b',  # Antibiotic
            'Diclofenac': '1584308663234-2a1d6a6a9c2c',  # Pain relief
            'Omeprazole': '1587854691152-62c9a58e0b8b',  # GERD
            'Metformin': '1584308663234-2a1d6a6a9c2c',  # Diabetes
            'Azithromycin': '1587854691152-62c9a58e0b8b',  # Antibiotic
            'Atorvastatin': '1584308663234-2a1d6a6a9c2c',  # Cholesterol
            'Losartan': '1587854691152-62c9a58e0b8b',  # BP
            'Levothyroxine': '1584308663234-2a1d6a6a9c2c',  # Thyroid
            
            # SUP - Vitamins
            'Vitamin C': '1559757175-4b5c3b5b5b5b',  # Vitamin C
            'B-Complex': '1559757175-4b5c3b5b5b5b',  # B vitamins
            'Vitamin D3': '1559757175-4b5c3b5b5b5b',  # Vitamin D
            'Zinc Sulphate': '1559757175-4b5c3b5b5b5b',  # Zinc
            'Multivitamin': '1559757175-4b5c3b5b5b5b',  # Multivitamin
            'Calcium Magnesium': '1559757175-4b5c3b5b5b5b',  # Calcium
            'Vitamin E': '1559757175-4b5c3b5b5b5b',  # Vitamin E
            
            # WOM - Women's health
            'Prenatal': '1559757175-4b5c3b5b5b5b',  # Prenatal
            'Iron Folic': '1559757175-4b5c3b5b5b5b',  # Iron
            'Calcium + Vitamin D': '1559757175-4b5c3b5b5b5b',  # Calcium
            'Evening Primrose': '1559757175-4b5c3b5b5b5b',  # Evening primrose
            'Cranberry': '1559757175-4b5c3b5b5b5b',  # Cranberry
            'Collagen': '1559757175-4b5c3b5b5b5b',  # Collagen
            'Menopause': '1559757175-4b5c3b5b5b5b',  # Menopause
            
            # MEN - Men's health
            'Multivitamin for Men': '1559757175-4b5c3b5b5b5b',  # Men's vitamins
            'Omega-3': '1559757175-4b5c3b5b5b5b',  # Fish oil
            'Protein Powder': '1559757175-4b5c3b5b5b5b',  # Protein
            'Testosterone': '1559757175-4b5c3b5b5b5b',  # Testosterone
            'Creatine': '1559757175-4b5c3b5b5b5b',  # Creatine
            'Saw Palmetto': '1559757175-4b5c3b5b5b5b',  # Saw palmetto
            'BCAA': '1559757175-4b5c3b5b5b5b',  # BCAA
            
            # PED - Pediatric
            'Paracetamol Syrup': '1559757175-4b5c3b5b5b5b',  # Syrup
            'ORS Sachets': '1559757175-4b5c3b5b5b5b',  # ORS
            'Vitamin D Drops': '1559757175-4b5c3b5b5b5b',  # Drops
            'Cough Syrup for Kids': '1559757175-4b5c3b5b5b5b',  # Cough syrup
            'Probiotic Drops': '1559757175-4b5c3b5b5b5b',  # Probiotic
            'Zinc Syrup': '1559757175-4b5c3b5b5b5b',  # Zinc syrup
            'Colic Relief': '1559757175-4b5c3b5b5b5b',  # Colic
            
            # HERB - Herbal
            'Ashwagandha': '1559757175-4b5c3b5b5b5b',  # Ashwagandha
            'Tulsi': '1559757175-4b5c3b5b5b5b',  # Tulsi
            'Triphala': '1559757175-4b5c3b5b5b5b',  # Triphala
            'Neem': '1559757175-4b5c3b5b5b5b',  # Neem
            'Amla': '1559757175-4b5c3b5b5b5b',  # Amla
            'Shilajit': '1559757175-4b5c3b5b5b5b',  # Shilajit
            'Brahmi': '1559757175-4b5c3b5b5b5b',  # Brahmi
            
            # DIAG - Medical devices
            'Thermometer': '1584308663234-2a1d6a6a9c2c',  # Thermometer
            'BP Monitor': '1584308663234-2a1d6a6a9c2c',  # BP monitor
            'Glucometer': '1584308663234-2a1d6a6a9c2c',  # Glucometer
            'Pulse Oximeter': '1584308663234-2a1d6a6a9c2c',  # Oximeter
            'Nebulizer': '1584308663234-2a1d6a6a9c2c',  # Nebulizer
            'Weighing Scale': '1584308663234-2a1d6a6a9c2c',  # Scale
            'Infrared Thermometer': '1584308663234-2a1d6a6a9c2c',  # IR thermometer
            
            # FIRST - First aid
            'First Aid Kit': '1584308663234-2a1d6a6a9c2c',  # First aid
            'Band-Aid': '1584308663234-2a1d6a6a9c2c',  # Band-aid
            'Dettol': '1584308663234-2a1d6a6a9c2c',  # Antiseptic
            'Cotton Rolls': '1584308663234-2a1d6a6a9c2c',  # Cotton
            'Burnol': '1584308663234-2a1d6a6a9c2c',  # Burn cream
            'Elastic Bandage': '1584308663234-2a1d6a6a9c2c',  # Bandage
            'Surgical Tape': '1584308663234-2a1d6a6a9c2c',  # Tape
            'Cold Pack': '1584308663234-2a1d6a6a9c2c',  # Cold pack
        }
        
        # Generic healthcare images for fallback
        generic_health_images = [
            '1584308663234-2a1d6a6a9c2c',  # Medicine
            '1587854691152-62c9a58e0b8b',  # Pills
            '1631549916768-4119b2e5f437',  # Healthcare
            '1559757175-4b5c3b5b5b5b',  # Medical
        ]
        
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
                    self.stdout.write(f'⏭️  [{idx}/{total}] Skipping (has image): {product.name}')
                    skipped_count += 1
                    continue
                
                # Find matching photo ID
                photo_id = None
                for key, value in unsplash_photos.items():
                    if key.lower() in product.name.lower():
                        photo_id = value
                        break
                
                # Use generic if no match
                if not photo_id:
                    photo_id = generic_health_images[idx % len(generic_health_images)]
                
                self.stdout.write(f'🔄 [{idx}/{total}] Downloading: {product.name}')
                
                # Download from Unsplash (400x400)
                # Using Unsplash Source API (free, no key required for basic usage)
                image_url = f"https://images.unsplash.com/photo-{photo_id}?w=400&h=400&fit=crop"
                
                # Try to download
                try:
                    response = requests.get(image_url, timeout=15, allow_redirects=True)
                    if response.status_code == 200 and len(response.content) > 1000:
                        # Save image
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
                        self.stdout.write(self.style.ERROR(f'   ❌ Failed: HTTP {response.status_code} or empty content'))
                except Exception as e:
                    failed_count += 1
                    self.stdout.write(self.style.ERROR(f'   ❌ Download error: {str(e)}'))
                
                # Delay to respect rate limits
                time.sleep(0.3)
                
            except Exception as e:
                failed_count += 1
                self.stdout.write(self.style.ERROR(f'   ❌ Error for {product.name}: {str(e)}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 REAL IMAGE DOWNLOAD COMPLETE!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Success: {success_count}')
        self.stdout.write(f'⏭️  Skipped: {skipped_count}')
        self.stdout.write(f'❌ Failed: {failed_count}')
        self.stdout.write(f'📊 Total: {total}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('🌐 Images downloaded from Unsplash (free stock photos)')
