#Payment routes
from django.urls import path
from .views import BookingListCreateView, BookingDetailView, ValidateCouponView
from .payment_views import (
    CreateStripePaymentIntentView,
    ConfirmStripePaymentView,
    StripeWebhookView,
    ChapaInitializeView,
    ChapaVerifyView,
    ChapaWebhookView,
)
from .payment_views import ExchangeRateView

urlpatterns = [
    # ── Core booking endpoints ────────────────────────────────────────────
    path("",                 BookingListCreateView.as_view(), name="booking-list-create"),
    path("validate-coupon/", ValidateCouponView.as_view(),   name="validate-coupon"),
    path("<str:reference>/", BookingDetailView.as_view(),    name="booking-detail"),

    # ── Stripe ────────────────────────────────────────────────────────────
    # 1. Frontend calls → receives client_secret
    path("payment/stripe/create-intent/",
         CreateStripePaymentIntentView.as_view(), name="stripe-create-intent"),
    # 2. Frontend calls AFTER Stripe.js confirms card → backend verifies
    path("payment/stripe/confirm/",
         ConfirmStripePaymentView.as_view(),      name="stripe-confirm"),
    # Stripe CLI → forwards events here during local development
    path("payment/stripe/webhook/",
         StripeWebhookView.as_view(),             name="stripe-webhook"),

    # ── Chapa (Telebirr / CBE Birr / Amole / Cards — unified checkout) ───
    # 1. Frontend calls → receives checkout_url → redirect user there
    path("payment/chapa/initialize/",
         ChapaInitializeView.as_view(),           name="chapa-initialize"),
    # 2. Frontend calls after user returns via return_url → verify with Chapa API
    path("payment/chapa/verify/<str:tx_ref>/",
         ChapaVerifyView.as_view(),               name="chapa-verify"),
    # Chapa POSTs here after payment (ngrok URL during local dev)
    path("payment/chapa/webhook/",
         ChapaWebhookView.as_view(),              name="chapa-webhook"),
    path(
    "payment/exchange-rate/",
    ExchangeRateView.as_view(),
    name="exchange-rate",
),
]
