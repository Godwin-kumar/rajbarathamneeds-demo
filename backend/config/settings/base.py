"""
Base Django settings for Luxury Jewellery E-Commerce backend.
"""
import os
import sys
import socket
import logging
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Add apps directory to sys.path so apps can be imported cleanly
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))

# Load environment variables from backend/.env or root .env
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-lux-jewellery-default-dev-key-change-in-prod')

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
]

LOCAL_APPS = [
    'apps.store_settings',
    'apps.categories',
    'apps.products',
    'apps.promotions',
    'apps.homepage',
    'apps.erp_core',
    'apps.customers',
    'apps.orders',
    'apps.inventory',
    'apps.purchases',
    'apps.finance',
    'apps.shipping',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# --------------------------------------------------------------------------
# DATABASE CONFIGURATION (Neon Cloud PostgreSQL)
# --------------------------------------------------------------------------
DATABASE_URL = os.getenv('DATABASE_URL', '')

is_real_neon = bool(
    DATABASE_URL and
    'user:password' not in DATABASE_URL and
    'your_' not in DATABASE_URL and
    'ep-sample' not in DATABASE_URL
)

def resolve_neon_hostaddr(hostname):
    """
    Resolve Neon hostname to an IPv4 address to prevent Windows DNS WSAHOST_NOT_FOUND
    (Errno 11001) caused by modern standby / sleeping sockets or broken IPv6 AAAA lookups.
    Falls back to verified Neon Singapore (ap-southeast-1) endpoints if local DNS lookup fails.
    """
    if not hostname:
        return None
    try:
        addr_info = socket.getaddrinfo(hostname, 5432, socket.AF_INET, socket.SOCK_STREAM)
        if addr_info and addr_info[0][4]:
            return addr_info[0][4][0]
    except Exception as exc:
        logger.warning("DNS resolution for %s failed: %s; applying resilient Neon IPv4 fallback.", hostname, exc)

    if 'ap-southeast-1' in hostname:
        return '52.76.128.157'
    return None

if is_real_neon:
    # Primary Neon Cloud PostgreSQL Database via psycopg
    db_config = dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=0,  # Serverless best-practice: avoid stale pooled connections on Neon PgBouncer
        conn_health_checks=True,
        ssl_require=True,
    )

    options = db_config.setdefault('OPTIONS', {})
    options.pop('channel_binding', None)

    host = db_config.get('HOST', '')
    if host and 'neon.tech' in host:
        hostaddr = resolve_neon_hostaddr(host)
        if hostaddr:
            options['hostaddr'] = hostaddr

    DATABASES = {
        'default': db_config
    }
else:
    # Temporary in-memory fallback ONLY for offline migration generation
    # until the developer supplies their Neon DATABASE_URL in backend/.env.
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }

# --------------------------------------------------------------------------
# IMAGEKIT CONFIGURATION
# --------------------------------------------------------------------------
IMAGEKIT_PUBLIC_KEY = os.getenv('IMAGEKIT_PUBLIC_KEY', '')
IMAGEKIT_PRIVATE_KEY = os.getenv('IMAGEKIT_PRIVATE_KEY', '')
IMAGEKIT_URL_ENDPOINT = os.getenv('IMAGEKIT_URL_ENDPOINT', '')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --------------------------------------------------------------------------
# DJANGO REST FRAMEWORK CONFIGURATION
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 12,
    'EXCEPTION_HANDLER': 'common.exceptions.custom_exception_handler',
}

# --------------------------------------------------------------------------
# CORS & CSRF CONFIGURATION
# --------------------------------------------------------------------------
CORS_ALLOW_CREDENTIALS = True
cors_origins = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,https://erp.rajbaratham.com,https://www.rajbaratham.com,https://rajbarathamneeds-demo-11.onrender.com'
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]

csrf_origins = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,https://erp.rajbaratham.com,https://www.rajbaratham.com,https://rajbarathamneeds-demo-11.onrender.com'
)
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_origins.split(',') if origin.strip()]
