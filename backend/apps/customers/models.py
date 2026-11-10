from django.db import models
from django.contrib.auth.models import User

class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile')
    name = models.CharField(max_length=200, db_index=True)
    email = models.EmailField(db_index=True, blank=True, null=True)
    phone = models.CharField(max_length=30, db_index=True)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone})"

    @property
    def total_orders_count(self):
        return self.orders.count()

    @property
    def total_spent_amount(self):
        from django.db.models import Sum
        total = self.orders.filter(status__in=['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PROCESSING']).aggregate(
            total=Sum('total_amount')
        )['total']
        return total or 0.00
