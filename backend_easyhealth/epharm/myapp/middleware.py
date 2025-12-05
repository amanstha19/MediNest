import time
import logging

logger = logging.getLogger(__name__)

class ResponseTimeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only log for API endpoints
        if request.path.startswith('/api/'):
            start_time = time.time()

            response = self.get_response(request)

            end_time = time.time()
            duration_ms = (end_time - start_time) * 1000

            logger.info(f"{request.method} {request.path} - {duration_ms:.2f}ms")

            # Add response time to response headers for easy viewing
            response['X-Response-Time'] = f"{duration_ms:.2f}ms"

            return response

        return self.get_response(request)
