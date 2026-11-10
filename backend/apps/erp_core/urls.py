from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ERPLoginView, ERPCurrentUserView, ERPLogoutView, ERPDashboardStatsView,
    ERPProductViewSet, ERPCategoryViewSet, ERPPromotionViewSet,
    ERPCustomerViewSet, ERPOrderViewSet, ERPInventoryViewSet,
    ERPInventoryMovementsView, ERPSupplierViewSet, ERPPurchaseOrderViewSet,
    ERPFinanceViewSet, ERPShipmentViewSet, ERPEmployeeViewSet,
    ERPAuditLogViewSet, ERPReportsExportView
)

router = DefaultRouter()
router.register(r'products', ERPProductViewSet, basename='erp-products')
router.register(r'categories', ERPCategoryViewSet, basename='erp-categories')
router.register(r'promotions', ERPPromotionViewSet, basename='erp-promotions')
router.register(r'customers', ERPCustomerViewSet, basename='erp-customers')
router.register(r'orders', ERPOrderViewSet, basename='erp-orders')
router.register(r'suppliers', ERPSupplierViewSet, basename='erp-suppliers')
router.register(r'purchases', ERPPurchaseOrderViewSet, basename='erp-purchases')
router.register(r'finance', ERPFinanceViewSet, basename='erp-finance')
router.register(r'shipping', ERPShipmentViewSet, basename='erp-shipping')
router.register(r'employees', ERPEmployeeViewSet, basename='erp-employees')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', ERPLoginView.as_view(), name='erp-login'),
    path('auth/me/', ERPCurrentUserView.as_view(), name='erp-current-user'),
    path('auth/logout/', ERPLogoutView.as_view(), name='erp-logout'),

    # Real Dashboard stats
    path('dashboard/stats/', ERPDashboardStatsView.as_view(), name='erp-dashboard-stats'),

    # Inventory management & movements
    path('inventory/', ERPInventoryViewSet.as_view(), name='erp-inventory'),
    path('inventory/movements/', ERPInventoryMovementsView.as_view(), name='erp-inventory-movements'),

    # Audit logs & Reports
    path('audit-logs/', ERPAuditLogViewSet.as_view(), name='erp-audit-logs'),
    path('reports/export/', ERPReportsExportView.as_view(), name='erp-reports-export'),

    # ViewSet routers
    path('', include(router.urls)),
]
