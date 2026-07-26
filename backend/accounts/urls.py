from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView, ChangePasswordView,
    ForgotPasswordView, ResetPasswordView, ValidateResetTokenView,NewsletterSubscribeView,NewsletterUnsubscribeView
)

urlpatterns = [
    # Auth
    path("register/",        RegisterView.as_view(),        name="auth-register"),
    path("token/",           TokenObtainPairView.as_view(), name="token-obtain"),
    path("token/refresh/",   TokenRefreshView.as_view(),    name="token-refresh"),

    # Profile
    path("profile/",         UserProfileView.as_view(),     name="user-profile"),
    path("change-password/", ChangePasswordView.as_view(),  name="change-password"),

    # Password reset
    path("forgot-password/",           ForgotPasswordView.as_view(),      name="forgot-password"),
    path("reset-password/",            ResetPasswordView.as_view(),        name="reset-password"),
    path("reset-password/<str:token>/",ValidateResetTokenView.as_view(),   name="validate-reset-token"),

    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(),       name="newsletter-subscribe"),
    path("newsletter/unsubscribe/", NewsletterUnsubscribeView.as_view(), name="newsletter-unsubscribe"),
]