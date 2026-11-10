from rest_framework import serializers
from .models import Product, ProductImage, FeaturedProduct
from apps.categories.serializers import CategorySerializer
from services.imagekit_service import imagekit_service

class ProductImageSerializer(serializers.ModelSerializer):
    card_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            'id',
            'image_url',
            'card_url',
            'thumbnail_url',
            'alt_text',
            'display_order',
            'is_primary',
        ]

    def get_card_url(self, obj):
        return imagekit_service.get_product_card_url(obj.image_url) if obj.image_url else ""

    def get_thumbnail_url(self, obj):
        return imagekit_service.get_thumbnail_url(obj.image_url) if obj.image_url else ""


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'sku',
            'price',
            'sale_price',
            'stock_quantity',
            'category',
            'primary_image',
            'images',
            'is_featured',
            'is_new_arrival',
            'created_at',
        ]

    def get_primary_image(self, obj):
        img = obj.primary_image
        if not img:
            return None
        return ProductImageSerializer(img).data


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    detail_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'sku',
            'short_description',
            'description',
            'price',
            'sale_price',
            'stock_quantity',
            'category',
            'primary_image',
            'images',
            'detail_image_url',
            'is_featured',
            'is_new_arrival',
            'created_at',
            'updated_at',
        ]

    def get_primary_image(self, obj):
        img = obj.primary_image
        if not img:
            return None
        return ProductImageSerializer(img).data

    def get_detail_image_url(self, obj):
        img = obj.primary_image
        if img and img.image_url:
            return imagekit_service.get_detail_url(img.image_url)
        return ""


class FeaturedProductSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = FeaturedProduct
        fields = [
            'id',
            'display_order',
            'is_active',
            'product',
        ]
