from django import forms
from django.contrib import admin
from django.utils.html import format_html
from .models import Category
from services.imagekit_service import imagekit_service

class CategoryAdminForm(forms.ModelForm):
    category_image = forms.ImageField(required=False, label="Upload Category Image to ImageKit")

    class Meta:
        model = Category
        fields = '__all__'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    form = CategoryAdminForm
    list_display = ('name', 'slug', 'display_order', 'is_active', 'image_preview', 'created_at')
    list_editable = ('display_order', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('is_active',)

    def image_preview(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" style="max-height: 40px; max-width: 60px; object-fit: cover; border-radius: 2px;" />', obj.image_url)
        return "-"
    image_preview.short_description = "Preview"

    def save_model(self, request, obj, form, change):
        img_file = form.cleaned_data.get('category_image')
        if img_file:
            upload_result = imagekit_service.upload_image(
                file_obj=img_file,
                file_name=f"cat_{obj.slug or img_file.name}",
                folder="/jewellery/categories/"
            )
            obj.image_url = upload_result.get('url')
            obj.imagekit_file_id = upload_result.get('file_id')
        super().save_model(request, obj, form, change)
