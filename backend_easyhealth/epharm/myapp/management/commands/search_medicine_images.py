#!/usr/bin/env python3
"""
Search and download real medicine images using Bing Image Search API.
Uses existing filenames to save images.
"""

import os
import requests
import time
import json
from django.core.management.base import BaseCommand
from myapp.models import Product
from PIL import Image
from io import BytesIO


class Command(BaseCommand):
    help = 'Search and download real medicine images using Bing Image Search API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace existing images',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=70,
            help='Number of products to process (default: 70)',
        )
        parser.add_argument(
            '--api-key',
            type=str,
            help='Bing Image Search API Key (or set BING_API_KEY env var)',
        )
        parser.add_argument(
            '--use-duckduckgo',
            action='store_true',
            help='Use DuckDuckGo image search instead of Bing (no API key needed)',
        )
        parser.add_argument(
            '--use-google',
            action='store_true',
            help='Use Google Custom Search API (requires API key)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting medicine image search...'))
        
        # Get API key
        api_key = options.get('api_key') or os.getenv('BING_API_KEY')
        
        # Get products
        if options['replace']:
            products = Product.objects.all()[:options['limit']]
        else:
            products = Product.objects.filter(
                image__isnull=True
            )[:options['limit']] or Product.objects.filter(
                image=''
            )[:options['limit']]
        
        if not products:
            self.stdout.write(self.style.WARNING('No products found needing images'))
            return
        
        self.stdout.write(f'Processing {len(products)} products...')
        
        success_count = 0
        
        for product in products:
            try:
                self.stdout.write(f'\n🔍 Searching for: {product.name}')
                
                # Determine search method
                if options['use_duckduckgo']:
                    image_url = self.search_duckduckgo(product.name)
                elif options['use_google']:
                    image_url = self.search_google(product.name, api_key)
                else:
                    image_url = self.search_bing(product.name, api_key)
                
                if image_url:
                    # Download image
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                    response = requests.get(image_url, headers=headers, timeout=15)
                    
                    if response.status_code == 200:
                        # Get existing filename or create new one
                        if product.image and not options['replace']:
                            # Extract filename from existing path
                            existing_filename = os.path.basename(product.image.name)
                            filename = existing_filename
                        else:
                            # Create new filename
                            safe_name = product.name.replace(' ', '_').replace('/', '_')[:30]
                            filename = f"{product.id}_{safe_name}.jpg"
                        
                        filepath = os.path.join('static', 'images', 'products', filename)
                        full_path = os.path.join(os.getcwd(), filepath)
                        
                        # Ensure directory exists
                        os.makedirs(os.path.dirname(full_path), exist_ok=True)
                        
                        # Process and save image
                        img = Image.open(BytesIO(response.content))
                        
                        # Convert to RGB if necessary
                        if img.mode in ('RGBA', 'P'):
                            img = img.convert('RGB')
                        
                        # Resize to consistent dimensions
                        img = img.resize((600, 600), Image.Resampling.LANCZOS)
                        
                        # Save with high quality
                        img.save(full_path, 'JPEG', quality=90)
                        
                        # Update product
                        product.image = f'products/{filename}'
                        product.save()
                        
                        success_count += 1
                        self.stdout.write(self.style.SUCCESS(f'   ✅ Saved: {filename}'))
                    else:
                        self.stdout.write(self.style.ERROR(f'   ❌ Download failed: HTTP {response.status_code}'))
                else:
                    self.stdout.write(self.style.WARNING(f'   ⚠️ No image found for: {product.name}'))
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error: {str(e)}'))
                continue
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Completed! Successfully downloaded {success_count} images'
        ))

    def get_search_term(self, product_name):
        """Generate optimized search term for medicine images"""
        # Add context to make search more specific
        search_terms = [
            f"{product_name} medicine product photo",
            f"{product_name} pharmaceutical tablet bottle",
            f"{product_name} medical drug packaging",
            f"{product_name} pharmacy product white background"
        ]
        
        # Use first term as default
        return search_terms[0]

    def search_bing(self, product_name, api_key):
        """
        Search using Bing Image Search API
        Requires: BING_API_KEY environment variable or --api-key
        """
        if not api_key:
            self.stdout.write(self.style.WARNING('No Bing API key provided, trying alternative...'))
            return None
        
        try:
            search_term = self.get_search_term(product_name)
            
            endpoint = "https://api.bing.microsoft.com/v7.0/images/search"
            headers = {"Ocp-Apim-Subscription-Key": api_key}
            params = {
                "q": search_term,
                "count": 5,
                "safeSearch": "Moderate",
                "imageType": "Photo",
                "aspect": "Square"
            }
            
            response = requests.get(endpoint, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('value'):
                    # Return first image URL
                    return data['value'][0]['contentUrl']
            
            return None
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Bing search error: {str(e)}'))
            return None

    def search_google(self, product_name, api_key):
        """
        Search using Google Custom Search API
        Requires: GOOGLE_API_KEY and GOOGLE_CX (search engine ID)
        """
        google_key = api_key or os.getenv('GOOGLE_API_KEY')
        cx = os.getenv('GOOGLE_CX')
        
        if not google_key or not cx:
            self.stdout.write(self.style.WARNING('Google API credentials not found'))
            return None
        
        try:
            search_term = self.get_search_term(product_name)
            
            endpoint = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": google_key,
                "cx": cx,
                "q": search_term,
                "searchType": "image",
                "num": 5,
                "imgSize": "medium",
                "safe": "active"
            }
            
            response = requests.get(endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('items'):
                    return data['items'][0]['link']
            
            return None
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Google search error: {str(e)}'))
            return None

    def search_duckduckgo(self, product_name):
        """
        Search using DuckDuckGo image search (no API key required)
        Uses duckduckgo-search Python package
        """
        try:
            # Try to import duckduckgo-search
            try:
                from duckduckgo_search import DDGS
            except ImportError:
                self.stdout.write(self.style.WARNING('duckduckgo-search not installed. Install with: pip install duckduckgo-search'))
                return None
            
            search_term = self.get_search_term(product_name)
            
            with DDGS() as ddgs:
                results = ddgs.images(
                    search_term,
                    max_results=5,
                    safesearch='moderate',
                    size='Medium'
                )
                
                for result in results:
                    return result['image']
            
            return None
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'DuckDuckGo search error: {str(e)}'))
            return None

    def search_unsplash(self, product_name):
        """
        Fallback: Search using Unsplash API (free tier available)
        """
        try:
            access_key = os.getenv('UNSPLASH_ACCESS_KEY')
            if not access_key:
                return None
            
            search_term = f"{product_name} medicine pharmaceutical"
            
            endpoint = "https://api.unsplash.com/search/photos"
            headers = {"Authorization": f"Client-ID {access_key}"}
            params = {
                "query": search_term,
                "per_page": 5,
                "orientation": "squarish"
            }
            
            response = requests.get(endpoint, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('results'):
                    return data['results'][0]['urls']['regular']
            
            return None
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unsplash search error: {str(e)}'))
            return None
