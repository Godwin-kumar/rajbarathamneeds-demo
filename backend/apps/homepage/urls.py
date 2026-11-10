from django.urls import path
from .views import HomepageDataAPIView

urlpatterns = [
    path('home/', HomepageDataAPIView.as_view(), name='homepage-data'),
]
