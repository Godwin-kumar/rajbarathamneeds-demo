from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Product, FeaturedProduct
from .serializers import ProductListSerializer, ProductDetailSerializer

class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    Supports:
    - Search: ?search=gold or ?q=ring
    - Category filter: ?category=rings or ?category_id=1
    - Featured filter: ?featured=true
    - New arrival filter: ?new=true
    - Pagination
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')

        # Search
        search = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search:
            search = search.strip()
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(short_description__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        # Category filter
        category = self.request.query_params.get('category')
        if category:
            if str(category).isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(Q(category__slug=category) | Q(category__name__iexact=category))

        # Quick flag filters
        if self.request.query_params.get('featured') == 'true':
            qs = qs.filter(is_featured=True)
        if self.request.query_params.get('new') == 'true':
            qs = qs.filter(is_new_arrival=True)

        return qs.order_by('-created_at')


class FeaturedProductListView(generics.ListAPIView):
    """
    GET /api/products/featured/
    Returns featured jewellery products ordered by display_order.
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        # Retrieve active products from FeaturedProduct entries or products marked is_featured
        featured_entries = FeaturedProduct.objects.filter(
            is_active=True,
            product__is_active=True
        ).select_related('product__category').prefetch_related('product__images').order_by('display_order', '-created_at')

        if featured_entries.exists():
            return [entry.product for entry in featured_entries]

        # Fallback to products flagged with is_featured=True
        return Product.objects.filter(
            is_featured=True,
            is_active=True
        ).select_related('category').prefetch_related('images').order_by('-created_at')[:8]


class NewArrivalListView(generics.ListAPIView):
    """
    GET /api/products/new-arrivals/
    Returns new arrivals ordered by latest creation.
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(
            is_new_arrival=True,
            is_active=True
        ).select_related('category').prefetch_related('images').order_by('-created_at')[:8]


class ProductDetailView(generics.RetrieveAPIView):
    """
    GET /api/products/{slug}/
    Returns complete product details, including all ordered product images.
    """
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
