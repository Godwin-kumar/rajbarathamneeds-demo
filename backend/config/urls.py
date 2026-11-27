
"""
Root URL Configuration for Luxury Jewellery E-Commerce
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Custom Admin Branding
admin.site.site_header = "Maison Jewellery — Administration"
admin.site.site_title = "Jewellery Admin Portal"
admin.site.index_title = "Catalogue Management"

urlpatterns = [
    path('admin/', admin.site.urls),

    # Homepage API
    path('api/home/', include('apps.homepage.urls')),

    # Categories API
    path('api/categories/', include('apps.categories.urls')),

    # Products API
    path('api/products/', include('apps.products.urls')),

    # Promotions API
    path('api/promotions/', include('apps.promotions.urls')),

    # Orders & Checkout API
    path('api/orders/', include('apps.orders.urls')),

    # Store Authentication API
    path('api/auth/', include('apps.customers.urls')),

    # ERP API
    path('api/erp/', include('apps.erp_core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
