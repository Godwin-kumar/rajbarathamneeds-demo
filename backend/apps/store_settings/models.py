from django.db import models

class StoreSettings(models.Model):
    store_name = models.CharField(max_length=255, default="Maison de Luxe")
    logo_url = models.URLField(max_length=500, blank=True, null=True, help_text="Cloud image URL from ImageKit")
    favicon_url = models.URLField(max_length=500, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    currency = models.CharField(max_length=10, default='INR')
    currency_symbol = models.CharField(max_length=10, default='₹')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Store Settings"
        verbose_name_plural = "Store Settings"
        ordering = ['-is_active', '-updated_at']

    def __str__(self):
        return f"{self.store_name} ({'Active' if self.is_active else 'Inactive'})"

    def save(self, *args, **kwargs):
        # Ensure only one active store settings record at a time
        if self.is_active:
            StoreSettings.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)
