from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q, Count
from apps.store_settings.models import StoreSettings
from apps.store_settings.serializers import StoreSettingsSerializer
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.products.models import Product, FeaturedProduct
from apps.products.serializers import ProductListSerializer
from apps.promotions.models import HomepageBanner, Promotion
from apps.promotions.serializers import HomepageBannerSerializer, PromotionSerializer

class HomepageDataAPIView(APIView):
    """
    GET /api/store/home/
    Single consolidated API returning all structured homepage data for high-performance rendering:
    - store settings
    - active banners
    - active categories
    - featured products
    - new arrivals
    - active promotions
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        now = timezone.now()

        # 1. Store settings
        store = StoreSettings.objects.filter(is_active=True).first()
        store_data = StoreSettingsSerializer(store).data if store else {
            'store_name': 'Maison de Luxe',
            'currency': 'INR',
            'currency_symbol': '₹',
            'contact_email': None,
            'contact_phone': None,
            'address': None,
            'logo_url': None,
        }

        # 2. Active banners
        banners_qs = HomepageBanner.objects.filter(
            is_active=True
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now),
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        ).order_by('display_order', '-created_at')
        banners_data = HomepageBannerSerializer(banners_qs, many=True).data

        # 3. Active categories
        categories_qs = Category.objects.filter(
            is_active=True
        ).annotate(
            active_products_count=Count('products', filter=Q(products__is_active=True))
        ).order_by('display_order', 'name')
        categories_data = CategorySerializer(categories_qs, many=True).data

        # 4. Featured products (Prefetch images and category)
        featured_entries = FeaturedProduct.objects.filter(
            is_active=True,
            product__is_active=True
        ).select_related('product__category').prefetch_related('product__images').order_by('display_order', '-created_at')

        if featured_entries.exists():
            featured_prods = [entry.product for entry in featured_entries]
        else:
            featured_prods = list(Product.objects.filter(
                is_featured=True,
                is_active=True
            ).select_related('category').prefetch_related('images').order_by('-created_at')[:8])

        featured_data = ProductListSerializer(featured_prods, many=True).data

        # 4b. All active products (For Homepage dynamic All Products & Category Filtering)
        all_products_qs = Product.objects.filter(
            is_active=True
        ).select_related('category').prefetch_related('images').order_by('-created_at')
        all_products_data = ProductListSerializer(all_products_qs, many=True).data

        # 5. New Arrivals
        new_arrivals_qs = Product.objects.filter(
            is_new_arrival=True,
            is_active=True
        ).select_related('category').prefetch_related('images').order_by('-created_at')[:8]
        new_arrivals_data = ProductListSerializer(new_arrivals_qs, many=True).data

        # 6. Active promotions
        promotions_qs = Promotion.objects.filter(
            is_active=True
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now),
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        ).order_by('display_order', '-created_at')
        promotions_data = PromotionSerializer(promotions_qs, many=True).data

        return Response({
            'store': store_data,
            'banners': banners_data,
            'categories': categories_data,
            'all_products': all_products_data,
            'featured_products': featured_data,
            'new_arrivals': new_arrivals_data,
            'promotions': promotions_data,
        })
