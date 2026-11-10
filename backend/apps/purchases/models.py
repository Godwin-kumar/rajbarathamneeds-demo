import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

class Supplier(models.Model):
    name = models.CharField(max_length=200, unique=True, db_index=True)
    contact_person = models.CharField(max_length=150, blank=True, default='')
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, default='')
    address = models.TextField(blank=True, default='')
    gst_number = models.CharField(max_length=30, blank=True, null=True, help_text="GSTIN / Tax ID")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
        ordering = ['name']

    def __str__(self):
        return self.name


class PurchaseOrderStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    ORDERED = 'ORDERED', 'Ordered'
    RECEIVED = 'RECEIVED', 'Goods Received'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PurchaseOrderPaymentStatus(models.TextChoices):
    UNPAID = 'UNPAID', 'Unpaid'
    PARTIAL = 'PARTIAL', 'Partially Paid'
    PAID = 'PAID', 'Fully Paid'

class PurchaseOrder(models.Model):
    po_number = models.CharField(max_length=64, unique=True, db_index=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    order_date = models.DateField(auto_now_add=True)
    expected_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=PurchaseOrderStatus.choices, default=PurchaseOrderStatus.DRAFT, db_index=True)
    payment_status = models.CharField(max_length=20, choices=PurchaseOrderPaymentStatus.choices, default=PurchaseOrderPaymentStatus.UNPAID)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_orders')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    received_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.po_number} ({self.supplier.name} - ₹{self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.po_number:
            import datetime
            now_str = datetime.datetime.now().strftime('%Y%m')
            random_suffix = uuid.uuid4().hex[:5].upper()
            self.po_number = f"PO-{now_str}-{random_suffix}"
        super().save(*args, **kwargs)


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='purchase_items')
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    received_quantity = models.PositiveIntegerField(default=0)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = 'Purchase Order Item'
        verbose_name_plural = 'Purchase Order Items'

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.purchase_order.po_number}"

    def save(self, *args, **kwargs):
        self.total_cost = self.unit_cost * self.quantity
        super().save(*args, **kwargs)
