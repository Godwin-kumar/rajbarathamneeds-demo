
from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.utils.html import format_html

from .models import Product, ProductSideImage
from services.imagekit_service import imagekit_service


# ==========================================================
# MAIN PRODUCT IMAGE FORM
# ==========================================================

class ProductAdminForm(forms.ModelForm):

    upload_main_image = forms.ImageField(
        required=False,
        label="Choose Main Product Image",
        help_text="Select the main product image from your computer."
    )

    class Meta:
        model = Product
        fields = [
            'name',
            'category',
            'price',
            'description',
            'dimensions',
            'upload_main_image',
        ]


# ==========================================================
# SIDE IMAGE FORM
# ==========================================================

class ProductSideImageInlineForm(forms.ModelForm):

    upload_file = forms.ImageField(
        required=False,
        label="Upload Side Image",
        help_text="Upload product side image to ImageKit."
    )

    class Meta:
        model = ProductSideImage
        fields = [
            'upload_file',
            'display_order',
        ]

    def clean(self):
        cleaned_data = super().clean()
        upload_file = cleaned_data.get('upload_file')

        if not self.instance.pk and not upload_file:
            self.add_error(
                'upload_file',
                'Please select an image file.'
            )

        return cleaned_data


# ==========================================================
# SIDE IMAGE INLINE
# ==========================================================

class ProductSideImageInline(admin.TabularInline):

    model = ProductSideImage
    form = ProductSideImageInlineForm

    extra = 1
    max_num = 5
    can_delete = True

    fields = (
        'upload_file',
        'preview',
        'display_order',
    )

    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj and obj.image_url:
            return format_html(
                '<img src="{}" style="max-height:60px; max-width:60px; '
                'object-fit:cover; border-radius:5px;" />',
                obj.image_url
            )

        return "No image uploaded"

    preview.short_description = "Image Preview"


# ==========================================================
# PRODUCT ADMIN
# ==========================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    form = ProductAdminForm

    list_display = (
        'name',
        'category',
        'price',
        'main_image_preview',
    )

    list_select_related = ('category',)

    search_fields = (
        'name',
        'description',
        'category__name',
    )

    inlines = [
        ProductSideImageInline,
    ]

    fieldsets = (
        (
            'Product Information',
            {
                'fields': (
                    'name',
                    'category',
                    'price',
                    'description',
                    'dimensions',
                )
            }
        ),
        (
            'Main Product Image',
            {
                'fields': (
                    'upload_main_image',
                    'main_image_preview',
                )
            }
        ),
    )

    readonly_fields = (
        'main_image_preview',
    )

    # ------------------------------------------------------
    # MAIN IMAGE PREVIEW
    # ------------------------------------------------------

    def main_image_preview(self, obj):

        if obj and obj.main_image:
            return format_html(
                '<img src="{}" style="max-height:120px; '
                'max-width:120px; object-fit:contain; '
                'border-radius:8px;" />',
                obj.main_image
            )

        return "No main image uploaded"

    main_image_preview.short_description = "Main Image Preview"

    # ------------------------------------------------------
    # UPLOAD MAIN IMAGE TO IMAGEKIT
    # ------------------------------------------------------

    def save_model(self, request, obj, form, change):

        uploaded = form.cleaned_data.get('upload_main_image')

        if uploaded:
            product_name = obj.name.replace(' ', '_')

            try:
                upload_res = imagekit_service.upload_image(
                    file_obj=uploaded,
                    file_name=f"{product_name}_main_{uploaded.name}",
                    folder="/jewellery/products/"
                )

                image_url = upload_res.get('url')

                if not image_url:
                    raise ValidationError(
                        "ImageKit did not return a main image URL."
                    )

                obj.main_image = image_url

            except Exception as exc:
                raise ValidationError(
                    f"Main image upload failed: {exc}"
                )

        super().save_model(request, obj, form, change)

    # ------------------------------------------------------
    # UPLOAD AND SAVE SIDE IMAGES
    # ------------------------------------------------------

    def save_formset(self, request, form, formset, change):

        instances = formset.save(commit=False)

        for obj in formset.deleted_objects:
            obj.delete()

        for instance in instances:

            inline_form = next(
                (
                    f for f in formset.forms
                    if f.instance == instance
                ),
                None
            )

            if inline_form:

                uploaded = inline_form.cleaned_data.get('upload_file')

                if uploaded:

                    product_name = instance.product.name.replace(
                        ' ', '_'
                    )

                    try:
                        upload_res = imagekit_service.upload_image(
                            file_obj=uploaded,
                            file_name=f"{product_name}_{uploaded.name}",
                            folder="/jewellery/products/"
                        )

                        image_url = upload_res.get('url')

                        if not image_url:
                            raise ValidationError(
                                "ImageKit did not return a side image URL."
                            )

                        instance.image_url = image_url

                    except Exception as exc:
                        raise ValidationError(
                            f"Side image upload failed: {exc}"
                        )

            if instance.image_url:
                instance.save()

        formset.save_m2m()
