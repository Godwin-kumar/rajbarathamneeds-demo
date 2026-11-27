
from django.urls import path
from .views import HomepageDataAPIView

urlpatterns = [
    path('', HomepageDataAPIView.as_view(), name='homepage-data-root'),
    path('home/', HomepageDataAPIView.as_view(), name='homepage-data'),
]
