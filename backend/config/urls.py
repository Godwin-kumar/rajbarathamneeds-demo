"""
Root URL Configuration for Luxury Jewellery E-Commerce
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Custom Admin branding
admin.site.site_header = "Maison Jewellery — Administration"
admin.site.site_title = "Jewellery Admin Portal"
admin.site.index_title = "Catalogue & Store Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/store/', include('apps.homepage.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/promotions/', include('apps.promotions.urls')),
    path('api/erp/', include('apps.erp_core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
