from django import forms
from django.contrib import admin
from django.utils.html import format_html
from .models import Product, ProductImage, FeaturedProduct
from services.imagekit_service import imagekit_service

class ProductImageInlineForm(forms.ModelForm):
    upload_file = forms.ImageField(
        required=False,
        label="Upload Image File",
        help_text="Upload original product photograph to ImageKit."
    )

    class Meta:
        model = ProductImage
        # image_url and imagekit_file_id are removed from manual entry.
        # They are automatically managed and populated by the backend.
        fields = ['upload_file', 'alt_text', 'display_order', 'is_primary']

    def clean(self):
        cleaned_data = super().clean()
        upload_file = cleaned_data.get('upload_file')
        # If this is a new row and no file was selected, ensure user provides an image
        if not self.instance.pk and not upload_file:
            if cleaned_data.get('alt_text') or cleaned_data.get('is_primary'):
                self.add_error('upload_file', 'Please select an image file to upload.')
        return cleaned_data


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    form = ProductImageInlineForm
    extra = 1
    # Exactly matching the user requirements:
    # 1. Upload Image File (file upload field)
    # 2. Image Preview (readonly)
    # 3. Alt Text
    # 4. Display Order
    # 5. Is Primary
    # 6. Delete option (handled by can_delete=True)
    fields = ('upload_file', 'preview', 'alt_text', 'display_order', 'is_primary')
    readonly_fields = ('preview',)
    can_delete = True

    def preview(self, obj):
        if obj and obj.image_url:
            return format_html(
                '<a href="{0}" target="_blank" rel="noopener noreferrer" title="Click to view full image">'
                '<img src="{0}" style="max-height: 50px; max-width: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #EAE6DE;" />'
                '</a>',
                obj.image_url
            )
        return format_html('<span style="color: #999; font-size: 11px;">[No image yet]</span>')
    preview.short_description = "Image Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'sku',
        'category',
        'price_formatted',
        'sale_price_formatted',
        'stock_quantity',
        'is_featured',
        'is_new_arrival',
        'is_active',
        'thumbnail_preview',
        'created_at'
    )
    list_filter = ('category', 'is_active', 'is_featured', 'is_new_arrival', 'created_at')
    search_fields = ('name', 'sku', 'short_description', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_featured', 'is_new_arrival', 'is_active', 'stock_quantity')
    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'sku', 'category', 'is_active')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'sale_price', 'stock_quantity')
        }),
        ('Display Badges & Positioning', {
            'fields': ('is_featured', 'is_new_arrival')
        }),
        ('Descriptions & Editorial Content', {
            'fields': ('short_description', 'description')
        }),
    )

    def price_formatted(self, obj):
        return f"₹{obj.price:,.2f}"
    price_formatted.short_description = "Price"

    def sale_price_formatted(self, obj):
        if obj.sale_price:
            return f"₹{obj.sale_price:,.2f}"
        return "-"
    sale_price_formatted.short_description = "Sale Price"

    def thumbnail_preview(self, obj):
        primary = obj.primary_image
        if primary and primary.image_url:
            return format_html(
                '<img src="{}" style="max-height: 45px; max-width: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #EAE6DE;" />',
                primary.image_url
            )
        return "-"
    thumbnail_preview.short_description = "Photo"

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)

        # 1. Handle deleted objects with ImageKit synchronization
        for obj in formset.deleted_objects:
            if isinstance(obj, ProductImage) and obj.imagekit_file_id:
                imagekit_service.delete_image(obj.imagekit_file_id)
            obj.delete()

        # 2. Process instances (new and existing)
        for instance in instances:
            if isinstance(instance, ProductImage):
                inline_form = next(
                    (f for f in formset.forms if f.instance == instance),
                    None
                )
                if inline_form:
                    uploaded = inline_form.cleaned_data.get('upload_file')
                    if uploaded:
                        sku = instance.product.sku or "general"
                        # Clean up previous cloud file if replacing
                        if instance.imagekit_file_id:
                            imagekit_service.delete_image(instance.imagekit_file_id)

                        upload_res = imagekit_service.upload_image(
                            file_obj=uploaded,
                            file_name=f"prod_{sku}_{uploaded.name}",
                            folder=f"/jewellery/products/{sku}/"
                        )
                        instance.image_url = upload_res.get('url')
                        instance.imagekit_file_id = upload_res.get('file_id')

                # Skip empty new inline rows that have neither uploaded file nor existing image_url
                if not instance.image_url:
                    continue

                instance.save()
        formset.save_m2m()


@admin.register(FeaturedProduct)
class FeaturedProductAdmin(admin.ModelAdmin):
    list_display = ('product', 'display_order', 'is_active', 'product_price', 'created_at')
    list_editable = ('display_order', 'is_active')
    search_fields = ('product__name', 'product__sku')
    list_filter = ('is_active',)

    def product_price(self, obj):
        return f"₹{obj.product.price:,.2f}"
    product_price.short_description = "Price"
