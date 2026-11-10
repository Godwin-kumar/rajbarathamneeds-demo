import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.customers.models import Customer
from apps.products.models import Product

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    PROCESSING = 'PROCESSING', 'Processing'
    SHIPPED = 'SHIPPED', 'Shipped'
    DELIVERED = 'DELIVERED', 'Delivered'
    CANCELLED = 'CANCELLED', 'Cancelled'
    RETURNED = 'RETURNED', 'Returned'

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PAID = 'PAID', 'Paid'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'

class PaymentMethod(models.TextChoices):
    ONLINE = 'ONLINE', 'Online Gateway'
    UPI = 'UPI', 'UPI'
    CARD = 'CARD', 'Credit/Debit Card'
    NETBANKING = 'NETBANKING', 'Net Banking'
    COD = 'COD', 'Cash on Delivery'

class Order(models.Model):
    order_number = models.CharField(max_length=64, unique=True, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=30)
    
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100, blank=True, default='')
    shipping_state = models.CharField(max_length=100, blank=True, default='')
    shipping_pincode = models.CharField(max_length=20, blank=True, default='')

    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING, db_index=True)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.ONLINE)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} (₹{self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import datetime
            now_str = datetime.datetime.now().strftime('%Y%m')
            random_suffix = uuid.uuid4().hex[:5].upper()
            self.order_number = f"RBN-{now_str}-{random_suffix}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100, blank=True, default='')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Order Status History'
        verbose_name_plural = 'Order Status Histories'
        ordering = ['-created_at']
