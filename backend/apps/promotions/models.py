
from django.db import models
from django.utils import timezone


class HomepageBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=300, blank=True, null=True)

    desktop_image_url = models.URLField(
        max_length=500,
        help_text="ImageKit CDN URL for desktop banner (21:9)"
    )

    mobile_image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional ImageKit CDN URL for mobile banner (4:5)"
    )

    imagekit_file_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    button_text = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default="Explore Collection"
    )

    button_link = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        default="/collections"
    )

    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)

    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Homepage Banner"
        verbose_name_plural = "Homepage Banners"
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"{self.title} (Order: {self.display_order})"

    def is_currently_valid(self):
        now = timezone.now()

        if not self.is_active:
            return False
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False

        return True


class Promotion(models.Model):

    DISCOUNT_TYPES = [
        ('PERCENTAGE', 'Percentage (%)'),
        ('FLAT', 'Flat Amount (₹)'),
    ]

    title = models.CharField(max_length=255)

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='promotions',
        null=True,
        blank=True
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPES,
        default='PERCENTAGE'
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True
    )

    class Meta:
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"
        ordering = ['-id']

    def __str__(self):
        suffix = '%' if self.discount_type == 'PERCENTAGE' else ' INR'
        return f"{self.title} - {self.discount_value}{suffix}"
