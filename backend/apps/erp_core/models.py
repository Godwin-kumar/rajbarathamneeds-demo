from django.db import models
from django.contrib.auth.models import User

class EmployeeRole(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
    ADMIN = 'ADMIN', 'Admin'
    MANAGER = 'MANAGER', 'Manager'
    EMPLOYEE = 'EMPLOYEE', 'Employee'

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    role = models.CharField(max_length=20, choices=EmployeeRole.choices, default=EmployeeRole.EMPLOYEE, db_index=True)
    department = models.CharField(max_length=100, blank=True, default='Operations')
    phone = models.CharField(max_length=20, blank=True, null=True)
    module_permissions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom permissions dictionary, e.g. {'products': True, 'orders': True, 'finance': False}"
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Employee Profile'
        verbose_name_plural = 'Employee Profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_role_display()})"

    def has_module_access(self, module_name):
        if not self.is_active or not self.user.is_active:
            return False
        if self.role == EmployeeRole.SUPER_ADMIN or self.user.is_superuser:
            return True
        if self.role == EmployeeRole.ADMIN:
            # Admins have access to operational modules
            if module_name in ['dashboard', 'products', 'categories', 'promotions', 'orders', 'customers', 'inventory', 'suppliers', 'purchases', 'sales', 'shipping', 'reports']:
                return True
        if self.role == EmployeeRole.MANAGER:
            if module_name in ['dashboard', 'orders', 'customers', 'inventory', 'sales', 'reports', 'shipping']:
                return True
        # Check custom module permissions
        return bool(self.module_permissions.get(module_name, False))


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50, db_index=True)
    module = models.CharField(max_length=50, db_index=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    affected_model = models.CharField(max_length=100, blank=True, null=True)
    affected_object_id = models.CharField(max_length=100, blank=True, null=True)
    changes_json = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']

    def __str__(self):
        user_display = self.user.username if self.user else 'System'
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {user_display} - {self.action} on {self.module}"
