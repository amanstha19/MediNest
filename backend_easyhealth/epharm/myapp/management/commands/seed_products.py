from django.core.management.base import BaseCommand
from myapp.models import Product, Category
import random

class Command(BaseCommand):
    help = 'Seed database with 30 sample products for FYP demo'

    def handle(self, *args, **kwargs):
        self.stdout.write('🚀 Starting to seed products...')
        
        # Use existing categories from your migration
        # OTC, RX, SUP, WOM, MEN, PED, HERB, DIAG, FIRST
        category_map = {
            'OTC': 'Over-the-Counter',
            'RX': 'Prescription Medicines',
            'SUP': 'Vitamins & Supplements',
            'WOM': "Women's Health",
            'MEN': "Men's Health",
            'PED': 'Pediatric Medicines',
            'HERB': 'Herbal & Ayurvedic',
            'DIAG': 'Medical Devices',
            'FIRST': 'First Aid',
        }
        
        categories = {}
        for value, label in category_map.items():
            try:
                cat = Category.objects.get(value=value)
                categories[value] = cat
                self.stdout.write(f'✓ Found category: {cat.label}')
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'⚠ Category not found: {value} - {label}'))
        
        # Product data - 60+ products matching your categories
        products_data = [
            # OTC - Over-the-Counter (8 products)
            {
                'name': 'Paracetamol 500mg',
                'generic_name': 'Paracetamol 500mg Tablets',
                'category': 'OTC',
                'price': 15,
                'stock': 100,
                'description': 'For fever and mild to moderate pain. Safe for all ages.',
                'prescription_required': False
            },
            {
                'name': 'Ibuprofen 400mg',
                'generic_name': 'Ibuprofen 400mg Tablets',
                'category': 'OTC',
                'price': 25,
                'stock': 80,
                'description': 'Anti-inflammatory pain reliever for headaches, muscle pain.',
                'prescription_required': False
            },
            {
                'name': 'Cetirizine 10mg',
                'generic_name': 'Cetirizine 10mg Tablets',
                'category': 'OTC',
                'price': 18,
                'stock': 120,
                'description': 'Antihistamine for allergies, runny nose, and sneezing.',
                'prescription_required': False
            },
            {
                'name': 'Digene Tablets',
                'generic_name': 'Digene Antacid Tablets',
                'category': 'OTC',
                'price': 35,
                'stock': 100,
                'description': 'Antacid for heartburn, acidity, and indigestion.',
                'prescription_required': False
            },
            {
                'name': 'Aspirin 100mg',
                'generic_name': 'Aspirin 100mg Tablets',
                'category': 'OTC',
                'price': 22,
                'stock': 90,
                'description': 'Pain reliever and blood thinner. Take with food.',
                'prescription_required': False
            },
            {
                'name': 'Loratadine 10mg',
                'generic_name': 'Loratadine 10mg Tablets',
                'category': 'OTC',
                'price': 28,
                'stock': 85,
                'description': 'Non-drowsy antihistamine for allergies and hay fever.',
                'prescription_required': False
            },
            {
                'name': 'Pantoprazole 40mg',
                'generic_name': 'Pantoprazole 40mg',
                'category': 'OTC',
                'price': 55,
                'stock': 70,
                'description': 'For acid reflux and stomach ulcers. OTC strength.',
                'prescription_required': False
            },
            {
                'name': 'ORS Liquid 200ml',
                'generic_name': 'Oral Rehydration Solution',
                'category': 'OTC',
                'price': 45,
                'stock': 150,
                'description': 'Ready-to-drink rehydration for diarrhea and vomiting.',
                'prescription_required': False
            },
            
            # RX - Prescription Medicines (8 products)
            {
                'name': 'Amoxicillin 500mg',
                'generic_name': 'Amoxicillin 500mg Capsules',
                'category': 'RX',
                'price': 85,
                'stock': 50,
                'description': 'Antibiotic for bacterial infections. Prescription required.',
                'prescription_required': True
            },
            {
                'name': 'Diclofenac 50mg',
                'generic_name': 'Diclofenac Sodium 50mg',
                'category': 'RX',
                'price': 45,
                'stock': 60,
                'description': 'Strong pain reliever for joint and muscle pain.',
                'prescription_required': True
            },
            {
                'name': 'Omeprazole 20mg',
                'generic_name': 'Omeprazole 20mg Capsules',
                'category': 'RX',
                'price': 120,
                'stock': 40,
                'description': 'For acid reflux, ulcers, and GERD treatment.',
                'prescription_required': True
            },
            {
                'name': 'Metformin 500mg',
                'generic_name': 'Metformin 500mg Tablets',
                'category': 'RX',
                'price': 95,
                'stock': 55,
                'description': 'Diabetes management medication. Prescription required.',
                'prescription_required': True
            },
            {
                'name': 'Azithromycin 500mg',
                'generic_name': 'Azithromycin 500mg Tablets',
                'category': 'RX',
                'price': 150,
                'stock': 45,
                'description': 'Antibiotic for respiratory and skin infections.',
                'prescription_required': True
            },
            {
                'name': 'Atorvastatin 10mg',
                'generic_name': 'Atorvastatin 10mg Tablets',
                'category': 'RX',
                'price': 180,
                'stock': 40,
                'description': 'Cholesterol lowering medication. Heart health.',
                'prescription_required': True
            },
            {
                'name': 'Losartan 50mg',
                'generic_name': 'Losartan Potassium 50mg',
                'category': 'RX',
                'price': 135,
                'stock': 50,
                'description': 'Blood pressure control medication.',
                'prescription_required': True
            },
            {
                'name': 'Levothyroxine 50mcg',
                'generic_name': 'Levothyroxine Sodium 50mcg',
                'category': 'RX',
                'price': 110,
                'stock': 35,
                'description': 'Thyroid hormone replacement therapy.',
                'prescription_required': True
            },
            
            # SUP - Vitamins & Supplements (7 products)
            {
                'name': 'Vitamin C 500mg',
                'generic_name': 'Vitamin C 500mg Chewable',
                'category': 'SUP',
                'price': 150,
                'stock': 200,
                'description': 'Immune system support. Chewable tablets.',
                'prescription_required': False
            },
            {
                'name': 'B-Complex Tablets',
                'generic_name': 'Vitamin B-Complex',
                'category': 'SUP',
                'price': 180,
                'stock': 150,
                'description': 'Energy and metabolism support. All B vitamins.',
                'prescription_required': False
            },
            {
                'name': 'Vitamin D3 1000IU',
                'generic_name': 'Vitamin D3 1000IU',
                'category': 'SUP',
                'price': 200,
                'stock': 100,
                'description': 'Bone health and immune support. Essential for calcium absorption.',
                'prescription_required': False
            },
            {
                'name': 'Zinc Sulphate 20mg',
                'generic_name': 'Zinc Sulphate 20mg',
                'category': 'SUP',
                'price': 120,
                'stock': 120,
                'description': 'Immune support and wound healing. Essential mineral.',
                'prescription_required': False
            },
            {
                'name': 'Multivitamin Syrup 200ml',
                'generic_name': 'Complete Multivitamin Syrup',
                'category': 'SUP',
                'price': 250,
                'stock': 80,
                'description': 'Complete daily nutrition for children and adults.',
                'prescription_required': False
            },
            {
                'name': 'Calcium Magnesium Zinc',
                'generic_name': 'Calcium Magnesium Zinc Tablets',
                'category': 'SUP',
                'price': 280,
                'stock': 90,
                'description': 'Bone health and muscle function support.',
                'prescription_required': False
            },
            {
                'name': 'Vitamin E 400IU',
                'generic_name': 'Vitamin E 400IU Softgels',
                'category': 'SUP',
                'price': 220,
                'stock': 70,
                'description': 'Antioxidant for skin health and immune support.',
                'prescription_required': False
            },
            
            # WOM - Women's Health (7 products)
            {
                'name': 'Prenatal Vitamins',
                'generic_name': 'Prenatal Multivitamin',
                'category': 'WOM',
                'price': 350,
                'stock': 60,
                'description': 'Complete nutrition for pregnant women. Folic acid, iron, calcium.',
                'prescription_required': False
            },
            {
                'name': 'Iron Folic Acid',
                'generic_name': 'Iron and Folic Acid Tablets',
                'category': 'WOM',
                'price': 85,
                'stock': 90,
                'description': 'For anemia prevention and women\'s health.',
                'prescription_required': False
            },
            {
                'name': 'Calcium + Vitamin D',
                'generic_name': 'Calcium with Vitamin D3',
                'category': 'WOM',
                'price': 220,
                'stock': 75,
                'description': 'Bone strength and osteoporosis prevention for women.',
                'prescription_required': False
            },
            {
                'name': 'Evening Primrose Oil',
                'generic_name': 'Evening Primrose Oil 1000mg',
                'category': 'WOM',
                'price': 380,
                'stock': 50,
                'description': 'Hormonal balance and skin health for women.',
                'prescription_required': False
            },
            {
                'name': 'Cranberry Extract',
                'generic_name': 'Cranberry Extract 500mg',
                'category': 'WOM',
                'price': 295,
                'stock': 65,
                'description': 'Urinary tract health support for women.',
                'prescription_required': False
            },
            {
                'name': 'Collagen Peptides',
                'generic_name': 'Hydrolyzed Collagen Peptides',
                'category': 'WOM',
                'price': 450,
                'stock': 45,
                'description': 'Skin elasticity and joint health supplement.',
                'prescription_required': False
            },
            {
                'name': 'Menopause Support',
                'generic_name': 'Menopause Relief Complex',
                'category': 'WOM',
                'price': 320,
                'stock': 40,
                'description': 'Natural relief for menopause symptoms.',
                'prescription_required': False
            },
            
            # MEN - Men's Health (7 products)
            {
                'name': 'Multivitamin for Men',
                'generic_name': 'Men\'s Daily Multivitamin',
                'category': 'MEN',
                'price': 280,
                'stock': 80,
                'description': 'Complete daily nutrition tailored for men\'s health needs.',
                'prescription_required': False
            },
            {
                'name': 'Omega-3 Fish Oil',
                'generic_name': 'Omega-3 Fish Oil 1000mg',
                'category': 'MEN',
                'price': 450,
                'stock': 50,
                'description': 'Heart health and brain function support.',
                'prescription_required': False
            },
            {
                'name': 'Protein Powder 500g',
                'generic_name': 'Whey Protein Powder',
                'category': 'MEN',
                'price': 1200,
                'stock': 40,
                'description': 'Muscle building and recovery protein supplement.',
                'prescription_required': False
            },
            {
                'name': 'Testosterone Booster',
                'generic_name': 'Natural Testosterone Support',
                'category': 'MEN',
                'price': 550,
                'stock': 35,
                'description': 'Natural testosterone support with herbal extracts.',
                'prescription_required': False
            },
            {
                'name': 'Creatine Monohydrate',
                'generic_name': 'Creatine Monohydrate 300g',
                'category': 'MEN',
                'price': 850,
                'stock': 30,
                'description': 'Strength and performance enhancement supplement.',
                'prescription_required': False
            },
            {
                'name': 'Saw Palmetto',
                'generic_name': 'Saw Palmetto Extract 500mg',
                'category': 'MEN',
                'price': 380,
                'stock': 45,
                'description': 'Prostate health support for men.',
                'prescription_required': False
            },
            {
                'name': 'BCAA Powder',
                'generic_name': 'Branched Chain Amino Acids',
                'category': 'MEN',
                'price': 650,
                'stock': 35,
                'description': 'Muscle recovery and endurance supplement.',
                'prescription_required': False
            },
            
            # PED - Pediatric Medicines (7 products)
            {
                'name': 'Paracetamol Syrup 60ml',
                'generic_name': 'Paracetamol Pediatric Syrup',
                'category': 'PED',
                'price': 65,
                'stock': 120,
                'description': 'Fever and pain relief for children. Strawberry flavor.',
                'prescription_required': False
            },
            {
                'name': 'ORS Sachets',
                'generic_name': 'Oral Rehydration Salts',
                'category': 'PED',
                'price': 20,
                'stock': 300,
                'description': 'For diarrhea and dehydration in children and adults.',
                'prescription_required': False
            },
            {
                'name': 'Vitamin D Drops',
                'generic_name': 'Vitamin D3 Pediatric Drops',
                'category': 'PED',
                'price': 180,
                'stock': 85,
                'description': 'Bone development and immunity for babies and children.',
                'prescription_required': False
            },
            {
                'name': 'Cough Syrup for Kids',
                'generic_name': 'Pediatric Cough Syrup',
                'category': 'PED',
                'price': 95,
                'stock': 100,
                'description': 'Honey-based cough relief for children 2+ years.',
                'prescription_required': False
            },
            {
                'name': 'Probiotic Drops',
                'generic_name': 'Pediatric Probiotic Drops',
                'category': 'PED',
                'price': 220,
                'stock': 60,
                'description': 'Digestive health and immunity for infants.',
                'prescription_required': False
            },
            {
                'name': 'Zinc Syrup 100ml',
                'generic_name': 'Zinc Sulphate Syrup',
                'category': 'PED',
                'price': 75,
                'stock': 90,
                'description': 'Immune support and growth for children.',
                'prescription_required': False
            },
            {
                'name': 'Colic Relief Drops',
                'generic_name': 'Simethicone Colic Drops',
                'category': 'PED',
                'price': 120,
                'stock': 70,
                'description': 'Gas and colic relief for babies.',
                'prescription_required': False
            },
            
            # HERB - Herbal & Ayurvedic (7 products)
            {
                'name': 'Ashwagandha Capsules',
                'generic_name': 'Ashwagandha 500mg',
                'category': 'HERB',
                'price': 320,
                'stock': 70,
                'description': 'Stress relief and energy booster. Natural adaptogen.',
                'prescription_required': False
            },
            {
                'name': 'Tulsi Drops',
                'generic_name': 'Tulsi (Holy Basil) Extract',
                'category': 'HERB',
                'price': 150,
                'stock': 95,
                'description': 'Immunity booster and respiratory health. Natural antibiotic.',
                'prescription_required': False
            },
            {
                'name': 'Triphala Churna',
                'generic_name': 'Triphala Powder 100g',
                'category': 'HERB',
                'price': 95,
                'stock': 110,
                'description': 'Digestive health and detoxification. Traditional Ayurvedic remedy.',
                'prescription_required': False
            },
            {
                'name': 'Neem Capsules',
                'generic_name': 'Neem Extract 500mg',
                'category': 'HERB',
                'price': 180,
                'stock': 80,
                'description': 'Blood purifier and skin health. Natural detox.',
                'prescription_required': False
            },
            {
                'name': 'Amla Juice 500ml',
                'generic_name': 'Indian Gooseberry Juice',
                'category': 'HERB',
                'price': 240,
                'stock': 65,
                'description': 'Vitamin C rich immunity booster. Antioxidant powerhouse.',
                'prescription_required': False
            },
            {
                'name': 'Shilajit Resin',
                'generic_name': 'Pure Shilajit Resin 30g',
                'category': 'HERB',
                'price': 550,
                'stock': 40,
                'description': 'Energy, vitality and strength. Himalayan mineral pitch.',
                'prescription_required': False
            },
            {
                'name': 'Brahmi Tablets',
                'generic_name': 'Bacopa Monnieri 500mg',
                'category': 'HERB',
                'price': 210,
                'stock': 75,
                'description': 'Memory and cognitive function support.',
                'prescription_required': False
            },
            
            # DIAG - Medical Devices (7 products)
            {
                'name': 'Digital Thermometer',
                'generic_name': 'Digital Thermometer',
                'category': 'DIAG',
                'price': 350,
                'stock': 40,
                'description': 'Fast and accurate temperature reading. Fever alarm.',
                'prescription_required': False
            },
            {
                'name': 'BP Monitor',
                'generic_name': 'Digital Blood Pressure Monitor',
                'category': 'DIAG',
                'price': 2500,
                'stock': 25,
                'description': 'Automatic blood pressure monitoring at home.',
                'prescription_required': False
            },
            {
                'name': 'Glucometer Kit',
                'generic_name': 'Blood Glucose Monitoring System',
                'category': 'DIAG',
                'price': 1200,
                'stock': 30,
                'description': 'Complete kit for blood sugar monitoring with 25 strips.',
                'prescription_required': False
            },
            {
                'name': 'Pulse Oximeter',
                'generic_name': 'Finger Pulse Oximeter',
                'category': 'DIAG',
                'price': 850,
                'stock': 50,
                'description': 'Blood oxygen and pulse rate monitoring.',
                'prescription_required': False
            },
            {
                'name': 'Nebulizer Machine',
                'generic_name': 'Compressor Nebulizer',
                'category': 'DIAG',
                'price': 1800,
                'stock': 20,
                'description': 'Respiratory treatment device for asthma and COPD.',
                'prescription_required': False
            },
            {
                'name': 'Weighing Scale Digital',
                'generic_name': 'Digital Body Weight Scale',
                'category': 'DIAG',
                'price': 950,
                'stock': 35,
                'description': 'Accurate weight monitoring with BMI calculation.',
                'prescription_required': False
            },
            {
                'name': 'Infrared Thermometer',
                'generic_name': 'Non-Contact IR Thermometer',
                'category': 'DIAG',
                'price': 1200,
                'stock': 45,
                'description': 'Contactless temperature screening device.',
                'prescription_required': False
            },
            
            # FIRST - First Aid (8 products)
            {
                'name': 'First Aid Kit',
                'generic_name': 'Complete First Aid Kit',
                'category': 'FIRST',
                'price': 450,
                'stock': 60,
                'description': 'Complete kit with bandages, antiseptic, scissors, and more.',
                'prescription_required': False
            },
            {
                'name': 'Band-Aid Assorted',
                'generic_name': 'Adhesive Bandages Pack',
                'category': 'FIRST',
                'price': 65,
                'stock': 150,
                'description': 'Sterile adhesive bandages in various sizes.',
                'prescription_required': False
            },
            {
                'name': 'Dettol Antiseptic 200ml',
                'generic_name': 'Dettol Antiseptic Liquid',
                'category': 'FIRST',
                'price': 180,
                'stock': 80,
                'description': 'Kills germs and prevents infection. For cuts and wounds.',
                'prescription_required': False
            },
            {
                'name': 'Cotton Rolls 100g',
                'generic_name': 'Sterile Cotton Rolls',
                'category': 'FIRST',
                'price': 45,
                'stock': 100,
                'description': 'Sterile cotton for wound cleaning and dressing.',
                'prescription_required': False
            },
            {
                'name': 'Burnol Cream 20g',
                'generic_name': 'Burn Healing Cream',
                'category': 'FIRST',
                'price': 85,
                'stock': 70,
                'description': 'Immediate relief for minor burns and scalds.',
                'prescription_required': False
            },
            {
                'name': 'Elastic Bandage 4 inch',
                'generic_name': 'Crepe Bandage Roll',
                'category': 'FIRST',
                'price': 75,
                'stock': 90,
                'description': 'Support and compression for sprains and strains.',
                'prescription_required': False
            },
            {
                'name': 'Surgical Tape 5m',
                'generic_name': 'Micropore Surgical Tape',
                'category': 'FIRST',
                'price': 55,
                'stock': 120,
                'description': 'Hypoallergenic tape for securing dressings.',
                'prescription_required': False
            },
            {
                'name': 'Instant Cold Pack',
                'generic_name': 'Disposable Cold Compress',
                'category': 'FIRST',
                'price': 95,
                'stock': 55,
                'description': 'Instant cold therapy for injuries and swelling.',
                'prescription_required': False
            },
        ]
        
        # Create products
        created_count = 0
        skipped_count = 0
        
        for prod_data in products_data:
            category = categories.get(prod_data['category'])
            if category:
                # Check if product already exists
                existing = Product.objects.filter(name=prod_data['name']).first()
                if existing:
                    self.stdout.write(f'⚠ Skipped (exists): {prod_data["name"]}')
                    skipped_count += 1
                    continue
                
                # Create new product
                product = Product.objects.create(
                    name=prod_data['name'],
                    generic_name=prod_data.get('generic_name', prod_data['name']),
                    category=category,
                    price=prod_data['price'],
                    stock=prod_data['stock'],
                    description=prod_data['description'],
                    prescription_required=prod_data['prescription_required']
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {product.name}'))
        
        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 SEEDING COMPLETE!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Products created: {created_count}')
        self.stdout.write(f'⏭️  Products skipped: {skipped_count}')
        self.stdout.write(f'📊 Total products in database: {Product.objects.count()}')
        self.stdout.write(f'🏷️  Total categories: {Category.objects.count()}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('🚀 You can now run your FYP defense demo with 30 products!')
