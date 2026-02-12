from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.cache import cache
import logging

from ..serializers import ProductSerializer, CategorySerializer
from ..models import Product, Category

logger = logging.getLogger(__name__)


@api_view(['GET'])
def getRoutes(request):
    return Response({'message': 'Hello from Django!'})


@api_view(['GET'])
def getProducts(request):
    # 1. Check cache
    data = cache.get("all_products")

    if data:
        print("➡️ CACHE HIT: Products List")
        return Response(data)

    print("❌ CACHE MISS: Products List")
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)

    data = serializer.data

    # Store in cache for 5 minutes
    cache.set("all_products", data, timeout=300)

    return Response(data)


@api_view(['GET'])
def getProduct(request, pk):
    cache_key = f"product_{pk}"

    # 1. Check cache
    data = cache.get(cache_key)

    if data:
        print(f"➡️ CACHE HIT: Product {pk}")
        return Response(data)

    print(f"❌ CACHE MISS: Product {pk}")

    try:
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product, many=False)
        data = serializer.data

        # Cache product for 5 minutes
        cache.set(cache_key, data, timeout=300)

        return Response(data)

    except Exception as e:
        logger.error(f"Error fetching product: {e}")
        return Response({'error': 'Product not found'}, status=404)


@api_view(['GET'])
def getCategories(request):
    """Get all categories for the frontend"""
    cache_key = "all_categories"
    data = cache.get(cache_key)

    if data:
        print("➡️ CACHE HIT: Categories List")
        return Response(data)

    print("❌ CACHE MISS: Categories List")
    categories = Category.objects.filter(is_active=True).order_by('order', 'label')
    serializer = CategorySerializer(categories, many=True)
    data = serializer.data

    # Cache for 10 minutes
    cache.set(cache_key, data, timeout=600)

    return Response(data)


class ProductSearchAPIView(APIView):
    def get(self, request, *args, **kwargs):
        search_query = request.GET.get('search', '').strip()
        category_value = request.GET.get('category', '').strip()
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 12))

        # Basic query for filtering by name and description (case-insensitive)
        filters = Q(name__icontains=search_query) | Q(description__icontains=search_query) | Q(generic_name__icontains=search_query)

        # Apply category filter if provided (filter by category__value since it's now a ForeignKey)
        if category_value:
            filters &= Q(category__value=category_value)

        # Get total count for pagination info
        total_count = Product.objects.filter(filters).count()

        # Get products with applied filters and pagination
        products = Product.objects.filter(filters)[offset:offset + limit]

        # Serialize and return the products
        product_data = [{
            "id": product.id,
            "name": product.name,
            "generic_name": product.generic_name,
            "category": product.category_value,
            "category_label": product.category_label,
            "description": product.description,
            "price": float(product.price) if product.price else 0,
            "stock": product.stock,
            "prescription_required": product.prescription_required,
            "image": product.image.url if product.image else None,
        } for product in products]

        return Response({
            "products": product_data,
            "total_count": total_count,
            "offset": offset,
            "limit": limit,
            "has_more": (offset + limit) < total_count
        }, status=status.HTTP_200_OK)


class AISearchAPIView(APIView):
    """
    AI-Powered Search API with semantic understanding, synonym matching,
    and category intent detection.
    """
    
    # Medical term synonyms for AI understanding
    MEDICAL_SYNONYMS = {
        'pain': ['analgesic', 'painkiller', 'relief', 'ache', 'discomfort', 'pain reliever'],
        'headache': ['migraine', 'head pain', 'cephalalgia', 'head ache'],
        'fever': ['pyrexia', 'temperature', 'febrile', 'high temperature'],
        'cold': ['flu', 'influenza', 'cough', 'congestion', 'runny nose', 'common cold'],
        'stomach': ['gastric', 'abdominal', 'digestive', 'acid', 'ulcer', 'stomach pain'],
        'baby': ['infant', 'pediatric', 'child', 'newborn', 'toddler', 'kids'],
        'skin': ['dermatology', 'rash', 'acne', 'eczema', 'topical', 'skin care'],
        'heart': ['cardiac', 'cardiovascular', 'blood pressure', 'hypertension', 'bp'],
        'eye': ['ophthalmic', 'vision', 'ocular', 'drops', 'eye care'],
        'vitamin': ['supplement', 'nutrition', 'mineral', 'multivitamin', 'dietary'],
        'antibiotic': ['antibacterial', 'infection', 'bacterial', 'antimicrobial'],
        'allergy': ['antihistamine', 'hypersensitivity', 'allergic', 'allergies'],
        'sleep': ['insomnia', 'sedative', 'hypnotic', 'rest', 'sleeping'],
        'stress': ['anxiety', 'calm', 'relaxation', 'mood', 'mental health'],
        'diabetes': ['blood sugar', 'glucose', 'insulin', 'hypoglycemic', 'sugar'],
        'cough': ['expectorant', 'suppressant', 'cold', 'throat'],
        'blood': ['circulation', 'anemia', 'iron', 'hemoglobin'],
        'bone': ['calcium', 'osteoporosis', 'joint', 'skeletal'],
        'liver': ['hepatic', 'detox', 'liver care'],
        'kidney': ['renal', 'urinary', 'kidney care'],
    }
    
    # Category intent mapping
    CATEGORY_INTENTS = {
        'baby': 'PED', 'infant': 'PED', 'child': 'PED', 'pediatric': 'PED', 'kids': 'PED',
        'prescription': 'RX', 'rx': 'RX', 'doctor': 'RX', 'prescribed': 'RX',
        'otc': 'OTC', 'over the counter': 'OTC', 'general': 'OTC', 'non-prescription': 'OTC',
        'vitamin': 'SUP', 'supplement': 'SUP', 'nutrition': 'SUP', 'dietary': 'SUP',
        'woman': 'WOM', 'women': 'WOM', 'female': 'WOM', 'ladies': 'WOM',
        'man': 'MEN', 'men': 'MEN', 'male': 'MEN', 'gentlemen': 'MEN',
        'herbal': 'HERB', 'ayurvedic': 'HERB', 'natural': 'HERB', 'organic': 'HERB',
        'device': 'DIAG', 'monitor': 'DIAG', 'machine': 'DIAG', 'equipment': 'DIAG',
        'first aid': 'FIRST', 'emergency': 'FIRST', 'bandage': 'FIRST', 'wound': 'FIRST',
    }
    
    def get_synonyms(self, query):
        """Get all synonyms for a given query"""
        query_lower = query.lower()
        synonyms = set()
        
        for term, term_synonyms in self.MEDICAL_SYNONYMS.items():
            if term in query_lower or any(s in query_lower for s in term_synonyms):
                synonyms.add(term)
                synonyms.update(term_synonyms)
        
        return list(synonyms)
    
    def detect_category_intent(self, query):
        """Detect category intent from query"""
        query_lower = query.lower()
        
        for intent, category in self.CATEGORY_INTENTS.items():
            if intent in query_lower:
                return category
        
        return None
    
    def calculate_relevance_score(self, product, query, synonyms):
        """Calculate relevance score for a product based on query match"""
        score = 0
        query_lower = query.lower()
        name = (product.generic_name or product.name or '').lower()
        description = (product.description or '').lower()
        
        # Exact match in name (highest priority)
        if query_lower in name:
            score += 100
        
        # Word match in name
        query_words = query_lower.split()
        for word in query_words:
            if len(word) > 2 and word in name:
                score += 50
        
        # Synonym match in name
        for synonym in synonyms:
            if synonym.lower() in name:
                score += 40
        
        # Match in description
        if query_lower in description:
            score += 30
        
        # Synonym match in description
        for synonym in synonyms:
            if synonym.lower() in description:
                score += 20
        
        # Category match bonus
        detected_category = self.detect_category_intent(query)
        if detected_category and product.category_value == detected_category:
            score += 25
        
        return score
    
    def get(self, request, *args, **kwargs):
        search_query = request.GET.get('search', '').strip()
        category_value = request.GET.get('category', '').strip()
        ai_enhanced = request.GET.get('ai', 'false').lower() == 'true'
        
        if not search_query:
            return Response({
                'results': [],
                'ai_enhanced': False,
                'message': 'No search query provided'
            }, status=status.HTTP_200_OK)
        
        # Get synonyms for AI enhancement
        synonyms = self.get_synonyms(search_query) if ai_enhanced else []
        
        # Detect category intent
        detected_category = self.detect_category_intent(search_query)
        if detected_category and not category_value:
            category_value = detected_category
        
        # Build search filters
        filters = Q()
        
        # Main query search
        filters |= Q(name__icontains=search_query)
        filters |= Q(generic_name__icontains=search_query)
        filters |= Q(description__icontains=search_query)
        
        # Synonym search (AI enhanced)
        if ai_enhanced and synonyms:
            for synonym in synonyms:
                filters |= Q(name__icontains=synonym)
                filters |= Q(generic_name__icontains=synonym)
                filters |= Q(description__icontains=synonym)
        
        # Apply category filter
        if category_value:
            filters &= Q(category__value=category_value)
        
        # Get products
        products = Product.objects.filter(filters).distinct()
        
        # Calculate relevance scores and sort
        scored_products = []
        for product in products:
            score = self.calculate_relevance_score(product, search_query, synonyms)
            scored_products.append({
                'product': product,
                'score': score,
                'ai_match': score > 0 and (len(synonyms) > 0 or detected_category)
            })
        
        # Sort by relevance score (descending)
        scored_products.sort(key=lambda x: x['score'], reverse=True)
        
        # Prepare response data
        product_data = [{
            "id": item['product'].id,
            "name": item['product'].name,
            "generic_name": item['product'].generic_name,
            "category": item['product'].category_value,
            "category_label": item['product'].category_label,
            "description": item['product'].description,
            "price": float(item['product'].price) if item['product'].price else 0,
            "stock": item['product'].stock,
            "prescription_required": item['product'].prescription_required,
            "image": item['product'].image.url if item['product'].image else None,
            "relevance_score": item['score'],
            "ai_match": item['ai_match']
        } for item in scored_products]
        
        # Prepare AI insights
        ai_insights = {
            'synonyms_used': synonyms if ai_enhanced else [],
            'detected_category': detected_category,
            'category_applied': category_value if category_value else None,
            'total_results': len(product_data),
            'ai_enhanced': ai_enhanced
        }
        
        return Response({
            'results': product_data,
            'ai_insights': ai_insights,
            'search_query': search_query
        }, status=status.HTTP_200_OK)
