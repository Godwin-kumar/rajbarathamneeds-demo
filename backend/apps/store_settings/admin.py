from django import forms
from django.contrib import admin
from django.utils.html import format_html
from .models import StoreSettings
from services.imagekit_service import imagekit_service

class StoreSettingsAdminForm(forms.ModelForm):
    logo_file = forms.ImageField(required=False, label="Upload Logo to ImageKit", help_text="Upload brand logo file directly to ImageKit cloud.")

    class Meta:
        model = StoreSettings
        fields = '__all__'

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    form = StoreSettingsAdminForm
    list_display = ('store_name', 'currency_symbol', 'currency', 'contact_email', 'contact_phone', 'is_active', 'logo_preview', 'updated_at')
    list_filter = ('is_active', 'currency')
    search_fields = ('store_name', 'contact_email', 'contact_phone')

    def logo_preview(self, obj):
        if obj.logo_url:
            return format_html('<img src="{}" style="max-height: 35px; max-width: 100px; object-fit: contain;" />', obj.logo_url)
        return "-"
    logo_preview.short_description = "Logo"

    def save_model(self, request, obj, form, change):
        logo_file = form.cleaned_data.get('logo_file')
        if logo_file:
            upload_result = imagekit_service.upload_image(
                file_obj=logo_file,
                file_name=f"logo_{logo_file.name}",
                folder="/jewellery/brand/"
            )
            obj.logo_url = upload_result.get('url')
        super().save_model(request, obj, form, change)
