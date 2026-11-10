from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'image_url',
            'is_active',
            'display_order',
            'products_count',
        ]

    def get_products_count(self, obj):
        # Count only active products in this category
        return getattr(obj, 'active_products_count', None) or obj.products.filter(is_active=True).count()
