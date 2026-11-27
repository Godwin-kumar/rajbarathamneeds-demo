
import re
from rest_framework import serializers
from .models import Product, ProductSideImage


class ProductSideImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductSideImage

        fields = [
            'id',
            'image_url',
            'display_order',
        ]


class ProductListSerializer(serializers.ModelSerializer):

    side_images = ProductSideImageSerializer(
        many=True,
        read_only=True
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True,
        default=''
    )
    category = serializers.SerializerMethodField()
    sku = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = [
            'id',
            'name',
            'price',
            'description',
            'dimensions',
            'main_image',
            'side_images',
            'category',
            'category_name',
            'sku',
            'weight',
        ]

    def get_category(self, obj):
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name}
        return None

    def get_sku(self, obj):
        if obj.dimensions and ('-' in obj.dimensions or 'SKU' in obj.dimensions.upper()):
            return obj.dimensions
        return f"NG-{obj.id:04d}"

    def get_weight(self, obj):
        text = f"{obj.dimensions or ''} {obj.description or ''}"
        match = re.search(r'(\d+(?:\.\d+)?\s*(?:g|gm|grams|kg))', text, re.IGNORECASE)
        return match.group(1) if match else None


class ProductDetailSerializer(serializers.ModelSerializer):

    side_images = ProductSideImageSerializer(
        many=True,
        read_only=True
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True,
        default=''
    )
    category = serializers.SerializerMethodField()
    sku = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = [
            'id',
            'name',
            'price',
            'description',
            'dimensions',
            'main_image',
            'side_images',
            'category',
            'category_name',
            'sku',
            'weight',
        ]

    def get_category(self, obj):
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name}
        return None

    def get_sku(self, obj):
        if obj.dimensions and ('-' in obj.dimensions or 'SKU' in obj.dimensions.upper()):
            return obj.dimensions
        return f"NG-{obj.id:04d}"

    def get_weight(self, obj):
        text = f"{obj.dimensions or ''} {obj.description or ''}"
        match = re.search(r'(\d+(?:\.\d+)?\s*(?:g|gm|grams|kg))', text, re.IGNORECASE)
        return match.group(1) if match else None
