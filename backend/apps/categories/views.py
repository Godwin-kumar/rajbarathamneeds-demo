from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from .models import Category
from .serializers import CategorySerializer

class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    Returns all jewellery categories.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.all().order_by('name')
