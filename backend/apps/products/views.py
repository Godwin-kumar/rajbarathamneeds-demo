
from rest_framework import generics
from rest_framework.permissions import AllowAny

from django.db.models import Q
from django.http import Http404

from .models import Product
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer
)


class ProductListView(generics.ListAPIView):
    """
    GET /api/products/

    Supports:
    - Search: ?search=gold or ?q=ring
    - Pagination
    """

    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        qs = Product.objects.all().prefetch_related('side_images')

        search = (
            self.request.query_params.get('search')
            or self.request.query_params.get('q')
        )

        if search:
            search = search.strip()

            qs = qs.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(dimensions__icontains=search)
            )

        return qs.order_by('-id')


class FeaturedProductListView(generics.ListAPIView):
    """
    GET /api/products/featured/

    Returns the latest products.
    """

    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):

        return Product.objects.all().prefetch_related(
            'side_images'
        ).order_by('-id')[:8]


class NewArrivalListView(generics.ListAPIView):
    """
    GET /api/products/new-arrivals/

    Returns recently added products.
    """

    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):

        return Product.objects.all().prefetch_related(
            'side_images'
        ).order_by('-id')[:8]


class ProductDetailView(generics.RetrieveAPIView):
    """
    GET /api/products/{slug_or_id}/

    Returns:
    - Product name
    - Price
    - Description
    - Dimensions
    - Main image
    - Five side images
    """

    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_object(self):

        lookup = self.kwargs.get('slug', '').strip()

        qs = self.get_queryset()

        if lookup.isdigit():

            obj = qs.filter(id=int(lookup)).first()

            if obj:
                return obj

        obj = qs.filter(name__iexact=lookup).first()

        if obj:
            return obj

        raise Http404(f"Product '{lookup}' not found")

    def get_queryset(self):

        return Product.objects.prefetch_related(
            'side_images'
        )
