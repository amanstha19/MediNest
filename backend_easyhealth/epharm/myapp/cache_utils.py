from django.core.cache import cache

def invalidate_product_cache():
    """Invalidate all product-related caches"""
    # Clear all product caches using cache.clear() for full cache invalidation
    cache.clear()
