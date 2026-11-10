from django.urls import path
from .views import ActiveBannerListView, ActivePromotionListView

urlpatterns = [
    path('', ActivePromotionListView.as_view(), name='promotion-list'),
    path('banners/', ActiveBannerListView.as_view(), name='banner-list'),
]
