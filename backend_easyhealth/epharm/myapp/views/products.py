from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.cache import cache
import logging

from ..serializers import ProductSerializer
from ..models import Product

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


class ProductSearchAPIView(APIView):
    def get(self, request, *args, **kwargs):
        search_query = request.GET.get('search', '').strip()
        category = request.GET.get('category', '').strip()

        # Basic query for filtering by name and description (case-insensitive)
        filters = Q(name__icontains=search_query) | Q(description__icontains=search_query)

        # Apply category filter if provided
        if category:
            filters &= Q(category=category)

        # Get products with applied filters
        products = Product.objects.filter(filters)

        # Serialize and return the products
        product_data = [{
            "id": product.id,
            "name": product.name,
            "generic_name": product.generic_name,
            "category": product.category,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "prescription_required": product.prescription_required,
            "image": product.image.url if product.image else None,
        } for product in products]

        return Response(product_data, status=status.HTTP_200_OK)
