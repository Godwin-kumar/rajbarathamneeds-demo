from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from .models import Category
from .serializers import CategorySerializer

class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    Returns all active jewellery categories ordered by display_order.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_active=True).annotate(
            active_products_count=Count('products', filter=Q(products__is_active=True))
        ).order_by('display_order', 'name')
