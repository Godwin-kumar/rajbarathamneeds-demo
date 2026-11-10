import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.erp_core.models import EmployeeProfile, EmployeeRole

class Command(BaseCommand):
    help = "Initializes default ERP Super Admin account and profile."

    def handle(self, *args, **options):
        username = os.getenv('ERP_ADMIN_USER', 'admin')
        email = os.getenv('ERP_ADMIN_EMAIL', 'admin@rajbaratham.com')
        password = os.getenv('ERP_ADMIN_PASSWORD', 'Admin@123')

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Raj',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )

        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        profile, _ = EmployeeProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': EmployeeRole.SUPER_ADMIN,
                'department': 'Executive Management',
                'phone': '+91 98765 43210',
                'is_active': True,
                'module_permissions': {
                    'dashboard': True,
                    'products': True,
                    'categories': True,
                    'promotions': True,
                    'orders': True,
                    'customers': True,
                    'inventory': True,
                    'suppliers': True,
                    'purchases': True,
                    'sales': True,
                    'finance': True,
                    'shipping': True,
                    'reports': True,
                    'employees': True,
                    'settings': True,
                }
            }
        )
        profile.role = EmployeeRole.SUPER_ADMIN
        profile.is_active = True
        profile.save()

        status_str = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{status_str} ERP Super Admin: '{username}' (Password updated)"))
