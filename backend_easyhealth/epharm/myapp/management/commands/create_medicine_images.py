import os
from PIL import Image, ImageDraw, ImageFont
from django.core.management.base import BaseCommand
from myapp.models import Product
import textwrap

class Command(BaseCommand):
    help = 'Create professional medicine images with product names and category colors'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace existing images',
        )

    def handle(self, *args, **options):
        replace_existing = options['replace']
        
        # Category colors (professional medical theme)
        category_colors = {
            'OTC': {'bg': '#E3F2FD', 'accent': '#1976D2', 'icon': '💊'},  # Blue
            'RX': {'bg': '#FFEBEE', 'accent': '#C62828', 'icon': '💉'},   # Red
            'SUP': {'bg': '#E8F5E9', 'accent': '#2E7D32', 'icon': '🌿'},  # Green
            'WOM': {'bg': '#FCE4EC', 'accent': '#C2185B', 'icon': '👩'},  # Pink
            'MEN': {'bg': '#E0F2F1', 'accent': '#00695C', 'icon': '👨'},  # Teal
            'PED': {'bg': '#FFF3E0', 'accent': '#EF6C00', 'icon': '👶'},  # Orange
            'HERB': {'bg': '#F3E5F5', 'accent': '#6A1B9A', 'icon': '🌱'}, # Purple
            'DIAG': {'bg': '#ECEFF1', 'accent': '#455A64', 'icon': '🏥'},  # Gray
            'FIRST': {'bg': '#FFF8E1', 'accent': '#F9A825', 'icon': '🚑'}, # Yellow
        }
        
        products = Product.objects.all()
        total = products.count()
        success_count = 0
        
        self.stdout.write(f'🎨 Creating professional medicine images for {total} products...')
        
        for idx, product in enumerate(products, 1):
            try:
                # Skip if has image and not replacing
                if not replace_existing and product.image and str(product.image) != '':
                    self.stdout.write(f'⏭️  [{idx}/{total}] Skipping: {product.name}')
                    success_count += 1
                    continue
                
                self.stdout.write(f'🎨 [{idx}/{total}] Creating: {product.name}')
                
                # Get category color
                cat_code = product.category.value if product.category else 'OTC'
                colors = category_colors.get(cat_code, category_colors['OTC'])
                
                # Create image
                img = self.create_medicine_image(product, colors)
                
                # Save
                filename = f"{product.id}_{product.name.replace(' ', '_').replace('/', '_')[:30]}.png"
                
                # Delete old image if exists
                if product.image:
                    try:
                        product.image.delete(save=False)
                    except:
                        pass
                
                # Save to buffer
                from io import BytesIO
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                buffer.seek(0)
                
                product.image.save(filename, buffer, save=True)
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created: {product.name}'))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error for {product.name}: {str(e)}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 MEDICINE IMAGES CREATED!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Success: {success_count}/{total}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('🎨 Features:')
        self.stdout.write('   • Category-specific colors')
        self.stdout.write('   • Product name clearly displayed')
        self.stdout.write('   • Professional medical design')
        self.stdout.write('   • Dosage information')
        self.stdout.write('   • Category icons')

    def create_medicine_image(self, product, colors):
        """Create a professional medicine product image"""
        width, height = 400, 400
        
        # Create base image
        img = Image.new('RGB', (width, height), colors['bg'])
        draw = ImageDraw.Draw(img)
        
        # Add gradient effect (simulated with rectangles)
        for i in range(50):
            alpha = int(255 * (1 - i/50))
            color = self.hex_to_rgb(colors['bg'], alpha)
            draw.rectangle([0, i*8, width, (i+1)*8], fill=color)
        
        # Draw border
        border_width = 8
        draw.rectangle(
            [border_width, border_width, width-border_width, height-border_width],
            outline=colors['accent'],
            width=border_width
        )
        
        # Try to load font, fallback to default
        try:
            # Try system fonts
            fonts_to_try = [
                '/System/Library/Fonts/Helvetica.ttc',
                '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                '/Windows/Fonts/arial.ttf',
            ]
            font_large = None
            font_medium = None
            font_small = None
            
            for font_path in fonts_to_try:
                if os.path.exists(font_path):
                    font_large = ImageFont.truetype(font_path, 32)
                    font_medium = ImageFont.truetype(font_path, 24)
                    font_small = ImageFont.truetype(font_path, 18)
                    break
            
            if not font_large:
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_small = ImageFont.load_default()
                
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Draw category icon (as text)
        draw.text((width//2, 60), colors['icon'], fill=colors['accent'], font=font_large, anchor='mm')
        
        # Draw product name (wrapped)
        name = product.name
        if len(name) > 25:
            name = name[:22] + '...'
        
        # Main product name
        draw.text((width//2, 140), name, fill=colors['accent'], font=font_large, anchor='mm')
        
        # Draw generic name if different
        if product.generic_name and product.generic_name != product.name:
            generic = product.generic_name
            if len(generic) > 30:
                generic = generic[:27] + '...'
            draw.text((width//2, 180), f"({generic})", fill='#666666', font=font_small, anchor='mm')
        
        # Draw dosage line
        draw.line([(50, 220), (350, 220)], fill=colors['accent'], width=2)
        
        # Draw price
        draw.text((width//2, 250), f"Rs. {product.price}", fill=colors['accent'], font=font_medium, anchor='mm')
        
        # Draw stock status
        stock_text = f"In Stock: {product.stock} units"
        draw.text((width//2, 290), stock_text, fill='#4CAF50' if product.stock > 0 else '#F44336', 
                  font=font_small, anchor='mm')
        
        # Draw prescription badge if required
        if getattr(product, 'prescription_required', False):
            # Draw badge background
            badge_y = 340
            draw.rounded_rectangle(
                [(100, badge_y-20), (300, badge_y+20)],
                radius=15,
                fill='#C62828'
            )
            draw.text((width//2, badge_y), "⚕️ PRESCRIPTION REQUIRED", 
                     fill='white', font=font_small, anchor='mm')
        else:
            # OTC badge
            badge_y = 340
            draw.rounded_rectangle(
                [(150, badge_y-20), (250, badge_y+20)],
                radius=15,
                fill=colors['accent']
            )
            draw.text((width//2, badge_y), "OTC", 
                     fill='white', font=font_small, anchor='mm')
        
        # Add corner decoration
        draw.polygon([(0, 0), (60, 0), (0, 60)], fill=colors['accent'])
        
        return img
    
    def hex_to_rgb(self, hex_color, alpha=255):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b)
