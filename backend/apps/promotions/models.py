from django.db import models
from django.utils import timezone

class HomepageBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    desktop_image_url = models.URLField(max_length=500, help_text="ImageKit CDN URL for desktop banner (21:9)")
    mobile_image_url = models.URLField(max_length=500, blank=True, null=True, help_text="Optional ImageKit CDN URL for mobile banner (4:5)")
    imagekit_file_id = models.CharField(max_length=255, blank=True, null=True)
    button_text = models.CharField(max_length=100, blank=True, null=True, default="Explore Collection")
    button_link = models.CharField(max_length=255, blank=True, null=True, default="/collections")
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
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='PERCENTAGE')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    coupon_code = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. TEMPLE10 or UTSAV20")
    destination_link = models.CharField(max_length=255, blank=True, null=True, default="#product-collection", help_text="Target URL or section link for Shop Now button")
    badge_text = models.CharField(max_length=60, blank=True, null=True, default="SPECIAL OFFER", help_text="e.g. FESTIVE SPECIAL, LIMITED PERIOD")
    banner_image_url = models.URLField(max_length=500, blank=True, null=True)
    imagekit_file_id = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.discount_value}{'%' if self.discount_type == 'PERCENTAGE' else ' INR'}"

    def is_currently_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True
