"""
WSGI configuration for MediNest on PythonAnywhere
"""

import os
import sys

# Add your project directory to the sys.path
path = '/home/yourusername/MediNest/backend_easyhealth/epharm'
if path not in sys.path:
    sys.path.append(path)

# Set environment variables
os.environ['DJANGO_SETTINGS_MODULE'] = 'epharm.settings_prod'

# Import Django and create the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
