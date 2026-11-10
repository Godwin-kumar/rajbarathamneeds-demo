from django import forms
from django.contrib import admin
from django.utils.html import format_html
from .models import HomepageBanner, Promotion
from services.imagekit_service import imagekit_service

class HomepageBannerAdminForm(forms.ModelForm):
    desktop_file = forms.ImageField(required=False, label="Upload Desktop Banner (ImageKit)")
    mobile_file = forms.ImageField(required=False, label="Upload Mobile Banner (ImageKit)")

    class Meta:
        model = HomepageBanner
        fields = '__all__'


@admin.register(HomepageBanner)
class HomepageBannerAdmin(admin.ModelAdmin):
    form = HomepageBannerAdminForm
    list_display = ('title', 'display_order', 'is_active', 'button_text', 'banner_preview', 'start_date', 'end_date')
    list_editable = ('display_order', 'is_active')
    search_fields = ('title', 'subtitle', 'button_text')
    list_filter = ('is_active', 'start_date', 'end_date')

    def banner_preview(self, obj):
        if obj.desktop_image_url:
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 100px; object-fit: cover; border-radius: 2px;" />',
                obj.desktop_image_url
            )
        return "-"
    banner_preview.short_description = "Preview"

    def save_model(self, request, obj, form, change):
        desk_file = form.cleaned_data.get('desktop_file')
        mob_file = form.cleaned_data.get('mobile_file')

        if desk_file:
            res = imagekit_service.upload_image(
                file_obj=desk_file,
                file_name=f"banner_desk_{desk_file.name}",
                folder="/jewellery/banners/"
            )
            obj.desktop_image_url = res.get('url')
            obj.imagekit_file_id = res.get('file_id')

        if mob_file:
            res_m = imagekit_service.upload_image(
                file_obj=mob_file,
                file_name=f"banner_mob_{mob_file.name}",
                folder="/jewellery/banners/"
            )
            obj.mobile_image_url = res_m.get('url')

        super().save_model(request, obj, form, change)


class PromotionAdminForm(forms.ModelForm):
    promo_image = forms.ImageField(required=False, label="Upload Promo Graphic (ImageKit)")

    class Meta:
        model = Promotion
        fields = '__all__'


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    form = PromotionAdminForm
    list_display = ('title', 'discount_type', 'discount_value', 'coupon_code', 'display_order', 'is_active', 'start_date', 'end_date')
    list_editable = ('display_order', 'is_active')
    search_fields = ('title', 'description', 'coupon_code')
    list_filter = ('is_active', 'discount_type')

    def save_model(self, request, obj, form, change):
        img_file = form.cleaned_data.get('promo_image')
        if img_file:
            res = imagekit_service.upload_image(
                file_obj=img_file,
                file_name=f"promo_{img_file.name}",
                folder="/jewellery/promotions/"
            )
            obj.banner_image_url = res.get('url')
            obj.imagekit_file_id = res.get('file_id')
        super().save_model(request, obj, form, change)
