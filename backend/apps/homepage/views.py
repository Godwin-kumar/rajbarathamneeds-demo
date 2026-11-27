
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.utils import timezone
from django.db.models import Q

from apps.store_settings.models import StoreSettings
from apps.store_settings.serializers import StoreSettingsSerializer

from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer

from apps.products.models import Product
from apps.products.serializers import ProductListSerializer

from apps.promotions.models import HomepageBanner, Promotion
from apps.promotions.serializers import (
    HomepageBannerSerializer,
    PromotionSerializer
)


class HomepageDataAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):

        now = timezone.now()

        # 1. Store Settings
        store = StoreSettings.objects.filter(
            is_active=True
        ).first()

        store_data = (
            StoreSettingsSerializer(store).data
            if store else {
                'store_name': 'Maison de Luxe',
                'currency': 'INR',
                'currency_symbol': '₹',
                'contact_email': None,
                'contact_phone': None,
                'address': None,
                'logo_url': None,
            }
        )

        # 2. Active Banners
        banners_qs = HomepageBanner.objects.filter(
            is_active=True
        ).filter(
            Q(start_date__isnull=True) |
            Q(start_date__lte=now),
            Q(end_date__isnull=True) |
            Q(end_date__gte=now)
        ).order_by(
            'display_order',
            '-created_at'
        )

        banners_data = HomepageBannerSerializer(
            banners_qs,
            many=True
        ).data

        # 3. Categories
        # Current Category model contains only id and name.
        categories_qs = Category.objects.all().order_by('name')

        categories_data = CategorySerializer(
            categories_qs,
            many=True
        ).data

        # 4. All Products
        products_qs = Product.objects.all().prefetch_related(
            'side_images'
        ).order_by('-id')

        all_products_data = ProductListSerializer(
            products_qs,
            many=True
        ).data

        # 5. Featured Products
        featured_prods = products_qs[:8]

        featured_data = ProductListSerializer(
            featured_prods,
            many=True
        ).data

        # 6. New Arrivals
        new_arrivals_qs = products_qs[:8]

        new_arrivals_data = ProductListSerializer(
            new_arrivals_qs,
            many=True
        ).data

        # 7. Active Promotions
        promotions_qs = Promotion.objects.filter(
            is_active=True
        ).select_related('product').order_by('-id')

        promotions_data = PromotionSerializer(
            promotions_qs,
            many=True
        ).data

        return Response({
            'store': store_data,
            'banners': banners_data,
            'categories': categories_data,
            'all_products': all_products_data,
            'featured_products': featured_data,
            'new_arrivals': new_arrivals_data,
            'promotions': promotions_data,
        })
