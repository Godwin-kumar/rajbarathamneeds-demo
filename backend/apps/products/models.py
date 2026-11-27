
from django.db import models
from apps.categories.models import Category


class Product(models.Model):

    name = models.CharField(max_length=255)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    dimensions = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    main_image = models.URLField(
        max_length=500,
        blank=True,
        null=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-id']


class ProductSideImage(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='side_images'
    )

    image_url = models.URLField(
        max_length=500
    )

    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"{self.product.name} - Side Image {self.display_order}"
