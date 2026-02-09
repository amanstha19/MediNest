import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from myapp.models import Product, Category
from PIL import Image, ImageDraw, ImageFont
import io

class Command(BaseCommand):
    help = 'Generate placeholder images for all products'

    def handle(self, *args, **kwargs):
        self.stdout.write('🎨 Generating placeholder images for products...')
        
        # Category colors for images
        category_colors = {
            'OTC': ('#4CAF50', '#2E7D32'),      # Green
            'RX': ('#F44336', '#C62828'),        # Red
            'SUP': ('#FF9800', '#EF6C00'),       # Orange
            'WOM': ('#E91E63', '#AD1457'),       # Pink
            'MEN': ('#2196F3', '#1565C0'),       # Blue
            'PED': ('#9C27B0', '#6A1B9A'),       # Purple
            'HERB': ('#8BC34A', '#558B2F'),      # Light Green
            'DIAG': ('#00BCD4', '#00838F'),      # Cyan
            'FIRST': ('#FF5722', '#D84315'),     # Deep Orange
        }
        
        # Category icons/emojis
        category_icons = {
            'OTC': '💊',
            'RX': '💉',
            'SUP': '⭐',
            'WOM': '👩',
            'MEN': '👨',
            'PED': '👶',
            'HERB': '🌿',
            'DIAG': '🏥',
            'FIRST': '🩹',
        }
        
        products = Product.objects.filter(image__isnull=True) | Product.objects.filter(image='')
        total = products.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('✅ All products already have images!'))
            return
        
        self.stdout.write(f'📸 Found {total} products without images')
        
        created_count = 0
        
        for product in products:
            try:
                # Get category color
                cat_value = product.category.value if product.category else 'OTC'
                primary_color, secondary_color = category_colors.get(cat_value, ('#607D8B', '#455A64'))
                icon = category_icons.get(cat_value, '📦')
                
                # Create image
                img = self.create_product_image(
                    product.name,
                    product.generic_name or product.name,
                    primary_color,
                    secondary_color,
                    icon,
                    f"Rs. {product.price}"
                )
                
                # Save image
                filename = f"{product.id}_{product.name.replace(' ', '_').replace('/', '_')[:30]}.png"
                product.image.save(filename, img, save=True)
                
                created_count += 1
                self.stdout.write(f'✓ Created image for: {product.name}')
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Failed for {product.name}: {str(e)}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 IMAGE GENERATION COMPLETE!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Images created: {created_count}')
        self.stdout.write(f"📊 Total products with images: {Product.objects.exclude(image__isnull=True).exclude(image='').count()}")
        self.stdout.write('=' * 50)

    def create_product_image(self, name, generic_name, primary_color, secondary_color, icon, price):
        """Create a placeholder product image"""
        # Create image (400x400)
        img = Image.new('RGB', (400, 400), primary_color)
        draw = ImageDraw.Draw(img)
        
        # Add gradient effect (simple)
        for y in range(400):
            alpha = int(255 * (1 - y / 400))
            color = self.hex_to_rgb(secondary_color)
            draw.line([(0, y), (400, y)], fill=color)
        
        # Try to use a font, fallback to default if not available
        try:
            # Try system fonts
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
            subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
            price_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        except:
            try:
                title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
                subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
                price_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
            except:
                title_font = ImageFont.load_default()
                subtitle_font = ImageFont.load_default()
                price_font = ImageFont.load_default()
        
        # Draw icon (centered, large)
        try:
            icon_font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 120)
        except:
            icon_font = title_font
        
        # Draw icon
        bbox = draw.textbbox((0, 0), icon, font=icon_font)
        icon_width = bbox[2] - bbox[0]
        icon_x = (400 - icon_width) // 2
        draw.text((icon_x, 60), icon, fill='white', font=icon_font)
        
        # Draw product name (wrapped if needed)
        words = name.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(' '.join(current_line)) > 20:
                lines.append(' '.join(current_line[:-1]))
                current_line = [current_line[-1]]
        if current_line:
            lines.append(' '.join(current_line))
        
        y_offset = 200
        for line in lines[:2]:  # Max 2 lines
            bbox = draw.textbbox((0, 0), line, font=title_font)
            text_width = bbox[2] - bbox[0]
            x = (400 - text_width) // 2
            draw.text((x, y_offset), line, fill='white', font=title_font)
            y_offset += 40
        
        # Draw generic name (smaller, italic style)
        if generic_name and generic_name != name:
            generic_short = generic_name[:30] + '...' if len(generic_name) > 30 else generic_name
            bbox = draw.textbbox((0, 0), generic_short, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            x = (400 - text_width) // 2
            draw.text((x, y_offset + 10), generic_short, fill='#E0E0E0', font=subtitle_font)
        
        # Draw price at bottom
        bbox = draw.textbbox((0, 0), price, font=price_font)
        text_width = bbox[2] - bbox[0]
        x = (400 - text_width) // 2
        draw.text((x, 340), price, fill='#FFD700', font=price_font)  # Gold color for price
        
        # Save to buffer
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return ContentFile(buffer.getvalue())

    def hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
