import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.orders.models import Order
from apps.purchases.models import PurchaseOrder

class TransactionType(models.TextChoices):
    INCOME = 'INCOME', 'Income (+)'
    EXPENSE = 'EXPENSE', 'Expense (-)'

class TransactionCategory(models.TextChoices):
    SALES = 'SALES', 'Sales Revenue'
    PURCHASE = 'PURCHASE', 'Supplier Inventory Purchase'
    SHIPPING = 'SHIPPING', 'Courier & Logistics'
    SALARY = 'SALARY', 'Employee Payroll'
    MARKETING = 'MARKETING', 'Advertising & Marketing'
    RENT = 'RENT', 'Facility / Workshop Rent'
    UTILITIES = 'UTILITIES', 'Electricity & Operations'
    REFUND = 'REFUND', 'Customer Order Refund'
    OTHER = 'OTHER', 'Other Operational'

class FinanceTransaction(models.Model):
    transaction_number = models.CharField(max_length=64, unique=True, db_index=True)
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices, db_index=True)
    category = models.CharField(max_length=20, choices=TransactionCategory.choices, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=30, default='BANK_TRANSFER')
    
    reference_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_records')
    reference_po = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_records')

    description = models.TextField(blank=True, default='')
    transaction_date = models.DateField(db_index=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_transactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Finance Transaction'
        verbose_name_plural = 'Finance Transactions'
        ordering = ['-transaction_date', '-created_at']

    def __str__(self):
        sign = '+' if self.transaction_type == TransactionType.INCOME else '-'
        return f"{self.transaction_number}: {sign}₹{self.amount} ({self.get_category_display()})"

    def save(self, *args, **kwargs):
        if not self.transaction_number:
            import datetime
            prefix = 'INC' if self.transaction_type == TransactionType.INCOME else 'EXP'
            now_str = datetime.datetime.now().strftime('%Y%m')
            random_suffix = uuid.uuid4().hex[:5].upper()
            self.transaction_number = f"TXN-{prefix}-{now_str}-{random_suffix}"
        super().save(*args, **kwargs)
