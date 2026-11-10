from django.urls import path
from .views import ProductListView, FeaturedProductListView, NewArrivalListView, ProductDetailView

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('featured/', FeaturedProductListView.as_view(), name='product-featured'),
    path('new-arrivals/', NewArrivalListView.as_view(), name='product-new-arrivals'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
