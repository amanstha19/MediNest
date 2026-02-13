

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
dotenv_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path)


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Security Keys
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")  # Fetching secret key
ESEWA_SECRET_KEY = os.getenv("ESEWA_SECRET_KEY")  # Fetching eSewa key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Fetching Gemini API key

# Debug mode (Set to False in production)
DEBUG = True

# Allow ngrok domains and localhost
ALLOWED_HOSTS = ["*"]  # Allows all hosts including ngrok domains
# For production, restrict to specific domains:
# ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.ngrok-free.app', 'yourdomain.com']

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Application definition

INSTALLED_APPS = [
    'unfold',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'myapp',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',


]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Keep only this one
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser'
    ],
}

# CORS Configuration - Allow frontend origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
]

# Allow ngrok domains dynamically
import re

# Custom CORS origin checker for ngrok
def cors_allow_ngrok(origin):
    """Allow ngrok-free.app domains and localhost"""
    if not origin:
        return False
    
    allowed_patterns = [
        r'^https?://localhost(:\d+)?$',
        r'^https?://127\.0\.0\.1(:\d+)?$',
        r'^https://[a-z0-9-]+\.ngrok-free\.app$',  # ngrok domains
    ]
    
    for pattern in allowed_patterns:
        if re.match(pattern, origin):
            return True
    
    return origin in CORS_ALLOWED_ORIGINS

# Use the custom checker
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://[a-z0-9-]+\.ngrok-free\.app$',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'https://childless-jimmy-tactlessly.ngrok-free.dev', # Add your specific ngrok domain
]

# Add ngrok domains to CSRF trusted origins dynamically
NGROK_BACKEND_URL = os.getenv('NGROK_BACKEND_URL', '')
NGROK_FRONTEND_URL = os.getenv('NGROK_FRONTEND_URL', '')

if NGROK_BACKEND_URL:
    CSRF_TRUSTED_ORIGINS.append(NGROK_BACKEND_URL)
    CORS_ALLOWED_ORIGINS.append(NGROK_BACKEND_URL)

if NGROK_FRONTEND_URL:
    CSRF_TRUSTED_ORIGINS.append(NGROK_FRONTEND_URL)
    CORS_ALLOWED_ORIGINS.append(NGROK_FRONTEND_URL)

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'ngrok-skip-browser-warning',
    'x-csrftoken',
    'x-requested-with',
]

ROOT_URLCONF = 'epharm.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'epharm.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'drf_pharmacy'),
        'USER': os.environ.get('POSTGRES_USER', 'drf_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'drf123'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', 5434),
    }
}

\
# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=20),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),

    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'myapp.CustomUser'
CORS_ALLOW_ALL_ORIGINS = True

CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_HTTPONLY = False

STATIC_URL = 'static/'

MEDIA_URL='/images/'

STATICFILES_DIRS =[
    BASE_DIR / 'static'
]

MEDIA_ROOT= BASE_DIR / 'static' / 'images'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')



SITE_URL = 'http://localhost:8000'

# Email Configuration
# Option 1: Console (Development - prints to terminal)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Option 2: Gmail SMTP (Free - 500 emails/day)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')  # Your Gmail address
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')  # App password (not regular password)
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@medinest.com')

# Option 3: Mailtrap (For testing - emails go to Mailtrap inbox)
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'sandbox.smtp.mailtrap.io'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'your-mailtrap-username'
# EMAIL_HOST_PASSWORD = 'your-mailtrap-password'

# Password Reset Settings
PASSWORD_RESET_TIMEOUT = 3600  # 1 hour in seconds



CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
]

# Django Unfold Configuration
UNFOLD = {
    "SITE_HEADER": "MediNest Admin",
    "SITE_TITLE": "MediNest Pharmacy",
    "INDEX_TITLE": "Dashboard Overview",
    "SITE_URL": "/",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_LINK": True,
    "SEARCH_FIELD": True,
    "ORDERING": ["-updated_at", "created_at"],
    
    # Disable reCAPTCHA to avoid errors
    "CAPTCHA_DISABLE": True,
    
    # Sidebar navigation
    "SIDEBAR": {
        "show_search": True,
        "navigation_expanded": True,
    },
    
    # Header configuration
    "HEADER": {
        "always_show_back": True,
    },
    
    # Custom links in sidebar
    "LINKS": [
        {
            "title": "📊 Dashboard",
            "link": "/admin/",
            "icon": "dashboard",
        },
        {
            "title": "🛒 Manage Orders",
            "link": "/admin/myapp/order/",
            "icon": "shopping_cart",
        },
        {
            "title": "💊 Products",
            "link": "/admin/myapp/product/",
            "icon": "medication",
        },
    ],
}

# Custom admin site
ADMIN_SITE_HEADER = "MediNest Pharmacy Admin"
ADMIN_SITE_TITLE = "MediNest"
ADMIN_INDEX_TITLE = "Dashboard Overview"
