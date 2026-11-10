from rest_framework import permissions
from .models import EmployeeRole

class IsERPAuthenticated(permissions.BasePermission):
    """
    Ensures user is logged in, active, and has an authorized EmployeeProfile or is staff/superuser.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        profile = getattr(request.user, 'employee_profile', None)
        return bool(profile and profile.is_active)


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'employee_profile', None)
        return bool(profile and profile.is_active and profile.role == EmployeeRole.SUPER_ADMIN)


class IsAdminOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        profile = getattr(request.user, 'employee_profile', None)
        return bool(profile and profile.is_active and profile.role in [EmployeeRole.SUPER_ADMIN, EmployeeRole.ADMIN])
