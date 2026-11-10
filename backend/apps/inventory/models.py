from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

class MovementType(models.TextChoices):
    STOCK_IN = 'STOCK_IN', 'Stock In (Direct)'
    STOCK_OUT = 'STOCK_OUT', 'Stock Out (Direct)'
    ADJUSTMENT = 'ADJUSTMENT', 'Audit Adjustment'
    SALE = 'SALE', 'Customer Order Sale'
    RETURN = 'RETURN', 'Customer Order Return'
    PURCHASE = 'PURCHASE', 'Supplier Goods Receipt'

class InventoryMovement(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_movements')
    movement_type = models.CharField(max_length=20, choices=MovementType.choices, db_index=True)
    quantity = models.IntegerField(help_text="Signed delta: positive increases stock, negative decreases")
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reference_number = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. PO-1001, RBN-ORD-202611")
    reason = models.TextField(blank=True, default='')
    adjusted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='inventory_adjustments')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Inventory Movement'
        verbose_name_plural = 'Inventory Movements'
        ordering = ['-created_at']

    def __str__(self):
        sign = '+' if self.quantity > 0 else ''
        return f"{self.product.name}: {sign}{self.quantity} ({self.get_movement_type_display()})"
