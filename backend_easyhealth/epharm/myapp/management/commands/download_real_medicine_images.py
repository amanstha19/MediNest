import os
import requests
import random
from PIL import Image
from io import BytesIO
from django.core.management.base import BaseCommand
from myapp.models import Product

class Command(BaseCommand):
    help = 'Download real medicine images from Unsplash API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace existing images',
        )
        parser.add_argument(
            '--api-key',
            type=str,
            help='Unsplash API Key (optional)',
        )

    def handle(self, *args, **options):
        replace_existing = options['replace']
        api_key = options.get('api_key')
        
        # Medicine-specific search terms for each product type
        medicine_search_terms = {
            'Paracetamol': 'paracetamol tablets medicine box',
            'Azithromycin': 'azithromycin antibiotic medicine',
            'Atorvastatin': 'atorvastatin cholesterol medicine',
            'Ibuprofen': 'ibuprofen pain relief medicine',
            'Cetirizine': 'cetirizine allergy medicine',
            'Amoxicillin': 'amoxicillin antibiotic capsules',
            'Diclofenac': 'diclofenac pain relief tablets',
            'Metformin': 'metformin diabetes medicine',
            'Omeprazole': 'omeprazole stomach medicine',
            'Vitamin C': 'vitamin C supplement bottle',
            'Vitamin D': 'vitamin D supplement',
            'B-Complex': 'vitamin B complex tablets',
            'Iron': 'iron supplement tablets',
            'Calcium': 'calcium supplement bottle',
            'Multivitamin': 'multivitamin bottle supplement',
            'Omega-3': 'omega 3 fish oil capsules',
            'Protein': 'protein powder supplement',
            'ORS': 'oral rehydration salts',
            'Ashwagandha': 'ashwagandha herbal supplement',
            'Tulsi': 'tulsi holy basil supplement',
            'Triphala': 'triphala ayurvedic medicine',
            'Neem': 'neem capsules herbal',
            'Amla': 'amla juice indian gooseberry',
            'Shilajit': 'shilajit resin supplement',
            'Brahmi': 'brahmi memory supplement',
            'Thermometer': 'digital thermometer medical device',
            'Glucometer': 'glucometer blood sugar device',
            'Pulse Oximeter': 'pulse oximeter medical device',
            'Nebulizer': 'nebulizer machine medical',
            'BP Monitor': 'blood pressure monitor device',
            'Weighing Scale': 'digital weighing scale',
            'First Aid': 'first aid kit box',
            'Band-Aid': 'band aid plasters box',
            'Dettol': 'dettol antiseptic bottle',
            'Burnol': 'burnol cream tube',
            'Bandage': 'elastic bandage roll',
            'Surgical Tape': 'surgical tape medical',
            'Cold Pack': 'instant cold pack',
            'Cotton': 'cotton rolls medical',
            'Cough Syrup': 'cough syrup bottle medicine',
            'Prenatal': 'prenatal vitamins pregnancy',
            'Menopause': 'menopause support supplement',
            'Creatine': 'creatine monohydrate supplement',
            'Saw Palmetto': 'saw palmetto prostate supplement',
            'BCAA': 'bcaa amino acid supplement',
            'Collagen': 'collagen peptides supplement',
            'Zinc': 'zinc supplement tablets',
            'Probiotic': 'probiotic supplement capsules',
            'Evening Primrose': 'evening primrose oil capsules',
            'Cranberry': 'cranberry extract supplement',
            'Testosterone': 'testosterone booster supplement',
            'Levothyroxine': 'levothyroxine thyroid medicine',
            'Losartan': 'losartan blood pressure medicine',
            'Pantoprazole': 'pantoprazole stomach medicine',
            'Loratadine': 'loratadine allergy medicine',
            'Aspirin': 'aspirin tablets medicine',
            'Tylenol': 'tylenol acetaminophen bottle',
            'Digene': 'digene antacid tablets',
            'Colic': 'colic relief drops baby',
        }
        
        # Generic search terms for fallback
        generic_terms = [
            'medicine tablets box pharmacy',
            'pharmaceutical pills bottle',
            'medical drugs packaging',
            'healthcare medicine box',
            'prescription drugs bottle',
            'pharmacy medicine tablets',
            'medical supplements bottle',
            'healthcare products packaging',
        ]
        
        products = Product.objects.all()
        total = products.count()
        success_count = 0
        
        self.stdout.write(f'🔍 Downloading real medicine images for {total} products...')
        self.stdout.write('⚠️  Note: Using Unsplash free API (50 requests/hour limit)')
        self.stdout.write('')
        
        for idx, product in enumerate(products, 1):
            try:
                # Skip if has image and not replacing
                if not replace_existing and product.image and str(product.image) != '':
                    self.stdout.write(f'⏭️  [{idx}/{total}] Skipping: {product.name}')
                    success_count += 1
                    continue
                
                self.stdout.write(f'🔍 [{idx}/{total}] Searching: {product.name}')
                
                # Get search term for this product
                search_term = self.get_search_term(product, medicine_search_terms, generic_terms)
                
                # Download image from Unsplash
                img = self.download_from_unsplash(search_term, api_key)
                
                if img:
                    # Save
                    filename = f"{product.id}_{product.name.replace(' ', '_').replace('/', '_')[:30]}.jpg"
                    
                    # Delete old image if exists
                    if product.image:
                        try:
                            product.image.delete(save=False)
                        except:
                            pass
                    
                    # Save to buffer
                    buffer = BytesIO()
                    img.save(buffer, format='JPEG', quality=90)
                    buffer.seek(0)
                    
                    product.image.save(filename, buffer, save=True)
                    success_count += 1
                    self.stdout.write(self.style.SUCCESS(f'   ✅ Downloaded: {product.name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'   ⚠️  No image found for: {product.name}'))
                
                # Rate limiting - be nice to the API
                import time
                time.sleep(1.5)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error for {product.name}: {str(e)}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 REAL MEDICINE IMAGES DOWNLOADED!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Success: {success_count}/{total}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('💡 Tips:')
        self.stdout.write('   • Images are from Unsplash (free stock photos)')
        self.stdout.write('   • For exact medicine photos, manually download from Google')
        self.stdout.write('   • Run with --replace to update all images')

    def get_search_term(self, product, medicine_terms, generic_terms):
        """Get appropriate search term for product"""
        name = product.name.lower()
        
        # Check for specific medicine matches
        for key, term in medicine_terms.items():
            if key.lower() in name:
                return term
        
        # Check generic name
        if product.generic_name:
            generic = product.generic_name.lower()
            for key, term in medicine_terms.items():
                if key.lower() in generic:
                    return term
        
        # Fallback to generic term based on category
        if product.category:
            cat_value = product.category.value
            category_terms = {
                'OTC': 'over the counter medicine tablets',
                'RX': 'prescription medicine pharmacy',
                'SUP': 'vitamin supplement bottle',
                'WOM': 'women health supplement',
                'MEN': 'men health supplement',
                'PED': 'children medicine syrup',
                'HERB': 'herbal ayurvedic medicine',
                'DIAG': 'medical device healthcare',
                'FIRST': 'first aid medical supplies',
            }
            return category_terms.get(cat_value, random.choice(generic_terms))
        
        return random.choice(generic_terms)

    def download_from_unsplash(self, query, api_key=None):
        """
        Download image from Unsplash API or source.unsplash.com
        """
        try:
            # Try source.unsplash.com first (no API key needed, but limited)
            # Format: https://source.unsplash.com/400x400/?medicine,tablets
            keywords = query.replace(' ', ',')
            url = f"https://source.unsplash.com/400x400/?{keywords}"
            
            self.stdout.write(f'   🌐 Searching: {keywords[:50]}...')
            
            response = requests.get(url, timeout=10, allow_redirects=True)
            
            if response.status_code == 200 and len(response.content) > 1000:
                img = Image.open(BytesIO(response.content))
                
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize to consistent size
                img = img.resize((400, 400), Image.Resampling.LANCZOS)
                
                return img
            else:
                return None
                
        except Exception as e:
            self.stdout.write(f'   ⚠️  Download error: {str(e)[:50]}')
            return None
