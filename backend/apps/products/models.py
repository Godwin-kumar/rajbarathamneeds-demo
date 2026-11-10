
from django.db import models
from django.utils.text import slugify
from apps.categories.models import Category
from common.validators import validate_positive_price, validate_stock_quantity

class Product(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=100, unique=True, db_index=True, help_text="Unique Stock Keeping Unit (e.g. JW-001)")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    short_description = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[validate_positive_price])
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, validators=[validate_positive_price])
    stock_quantity = models.PositiveIntegerField(default=0, validators=[validate_stock_quantity])
    is_featured = models.BooleanField(default=False, db_index=True)
    is_new_arrival = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        primary = self.images.filter(is_primary=True).first()
        if not primary:
            primary = self.images.order_by('display_order', 'id').first()
        return primary


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="ImageKit CDN URL")
    imagekit_file_id = models.CharField(max_length=255, blank=True, null=True, help_text="ImageKit unique file ID")
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name} (order: {self.display_order})"

    def save(self, *args, **kwargs):
        # Ensure only one image is primary per product
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class FeaturedProduct(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='featured_entry')
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Featured Product"
        verbose_name_plural = "Featured Products"
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"Featured: {self.product.name} (Order: {self.display_order})"
