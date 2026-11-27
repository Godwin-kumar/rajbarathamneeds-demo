from django.urls import path
from .views import (
    CustomerLoginView,
    CustomerRegisterView,
    CustomerCurrentUserView,
    CustomerLogoutView,
    CustomerForgotPasswordView,
    CustomerWishlistView,
)

urlpatterns = [
    path('login/', CustomerLoginView.as_view(), name='auth-login'),
    path('register/', CustomerRegisterView.as_view(), name='auth-register'),
    path('me/', CustomerCurrentUserView.as_view(), name='auth-current-user'),
    path('logout/', CustomerLogoutView.as_view(), name='auth-logout'),
    path('forgot-password/', CustomerForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('wishlist/', CustomerWishlistView.as_view(), name='auth-wishlist'),
]
