from django.urls import path
from .views import (
    CheckoutCalculateView,
    AddressManagementView,
    CreateOrderView,
    CustomerOrdersListView,
    OrderDetailView,
)

urlpatterns = [
    path('calculate/', CheckoutCalculateView.as_view(), name='checkout-calculate'),
    path('addresses/', AddressManagementView.as_view(), name='order-addresses'),
    path('create/', CreateOrderView.as_view(), name='order-create'),
    path('checkout/', CreateOrderView.as_view(), name='order-checkout'),
    path('my-orders/', CustomerOrdersListView.as_view(), name='orders-my-orders'),
    path('summary/<str:order_number>/', OrderDetailView.as_view(), name='order-summary-detail'),
]
