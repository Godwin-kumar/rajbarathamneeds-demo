from django.urls import path
from .views import ActiveBannerListView, ActivePromotionListView, PromotionDetailView

urlpatterns = [
    path('', ActivePromotionListView.as_view(), name='promotion-list'),
    path('banners/', ActiveBannerListView.as_view(), name='banner-list'),
    path('<str:pk>/', PromotionDetailView.as_view(), name='promotion-detail'),
]
