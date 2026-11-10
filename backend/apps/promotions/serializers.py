from rest_framework import serializers
from .models import HomepageBanner, Promotion
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


class PromotionSerializer(serializers.ModelSerializer):
    formatted_discount = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id',
            'title',
            'description',
            'discount_type',
            'discount_value',
            'formatted_discount',
            'banner_image_url',
            'banner_url',
            'coupon_code',
            'destination_link',
            'badge_text',
            'display_order',
            'is_active',
            'start_date',
            'end_date',
        ]

    def get_formatted_discount(self, obj):
        if obj.discount_type == 'PERCENTAGE':
            val = int(obj.discount_value) if obj.discount_value == int(obj.discount_value) else obj.discount_value
            return f"{val}% OFF"
        val = int(obj.discount_value) if obj.discount_value == int(obj.discount_value) else obj.discount_value
        return f"FLAT ₹{val} OFF"

    def get_banner_url(self, obj):
        return obj.banner_image_url or ""
