from django.db import models
from apps.orders.models import Order

class ShippingStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Dispatch'
    DISPATCHED = 'DISPATCHED', 'Dispatched'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
    DELIVERED = 'DELIVERED', 'Delivered'
    RETURNED = 'RETURNED', 'Returned'

class Shipment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    courier_name = models.CharField(max_length=100, blank=True, default='')
    tracking_number = models.CharField(max_length=100, blank=True, default='', db_index=True)
    dispatch_date = models.DateTimeField(blank=True, null=True)
    estimated_delivery = models.DateField(blank=True, null=True)
    actual_delivery = models.DateTimeField(blank=True, null=True)
    shipping_status = models.CharField(max_length=20, choices=ShippingStatus.choices, default=ShippingStatus.PENDING, db_index=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_address = models.TextField()
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Shipment'
        verbose_name_plural = 'Shipments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Shipment for {self.order.order_number} ({self.courier_name} - {self.tracking_number or 'No AWB'})"
