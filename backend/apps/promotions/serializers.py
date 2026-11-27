from rest_framework import serializers
from .models import HomepageBanner, Promotion
from apps.products.models import Product
from services.imagekit_service import imagekit_service

class HomepageBannerSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomepageBanner
        fields = [
            'id',
            'title',
            'subtitle',
            'desktop_image_url',
            'mobile_image_url',
            'hero_image_url',
            'button_text',
            'button_link',
            'display_order',
            'is_active',
        ]

    def get_hero_image_url(self, obj):
        return imagekit_service.get_hero_url(obj.desktop_image_url) if obj.desktop_image_url else ""


class PromotionProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'description',
            'dimensions',
            'main_image',
        ]


class PromotionSerializer(serializers.ModelSerializer):
    product = PromotionProductSerializer(read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True, allow_null=True)
    formatted_discount = serializers.SerializerMethodField()
    banner_image_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    badge_text = serializers.SerializerMethodField()
    coupon_code = serializers.SerializerMethodField()
    destination_link = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id',
            'title',
            'product',
            'product_id',
            'discount_type',
            'discount_value',
            'is_active',
            'formatted_discount',
            'banner_image_url',
            'banner_url',
            'description',
            'badge_text',
            'coupon_code',
            'destination_link',
            'start_date',
            'end_date',
        ]

    def get_formatted_discount(self, obj):
        try:
            val = float(obj.discount_value)
            display_val = int(val) if val.is_integer() else val
            if obj.discount_type == 'PERCENTAGE':
                return f"{display_val}% OFF"
            return f"FLAT ₹{int(val):,} OFF"
        except (ValueError, TypeError):
            return ""

    def get_banner_image_url(self, obj):
        if obj.product and obj.product.main_image:
            return obj.product.main_image
        return ""

    def get_banner_url(self, obj):
        return self.get_banner_image_url(obj)

    def get_description(self, obj):
        if obj.product and obj.product.description:
            return obj.product.description
        return ""

    def get_badge_text(self, obj):
        if obj.discount_type == 'PERCENTAGE':
            try:
                val = float(obj.discount_value)
                display_val = int(val) if val.is_integer() else val
                return f"{display_val}% OFF"
            except (ValueError, TypeError):
                pass
        return "SPECIAL OFFER"

    def get_coupon_code(self, obj):
        return ""

    def get_destination_link(self, obj):
        if obj.product_id:
            return f"/products/{obj.product_id}"
        return "/products"

    def get_start_date(self, obj):
        return None

    def get_end_date(self, obj):
        return None
