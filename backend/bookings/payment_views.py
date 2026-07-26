"""
Payment Integration Views — Stripe + Chapa
============================================

Two payment gateways:

  STRIPE  → International card payments (Visa, Mastercard, Amex, Apple Pay)
  CHAPA   → Ethiopian unified gateway (Telebirr, CBE Birr, Amole, Awash,
             Dashen, Abyssinia Bank, and international cards)

Flow summary:
  Stripe: client_secret → browser confirms card → backend verifies → confirmed
  Chapa:  initialize → redirect to Chapa page → webhook fires → confirmed
          (also: frontend calls /verify/ after return_url redirect as backup)

Local webhook testing:
  Stripe CLI: stripe listen --forward-to localhost:8000/api/v1/bookings/payment/stripe/webhook/
  Chapa/ngrok: ngrok http 8000   →  copy https URL into Chapa Dashboard
"""

import stripe
import hashlib
import hmac
import json
import requests
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from django.db import transaction

from .models import Booking, Payment, get_usd_to_etb_rate
from packages.models import Availability

# ── Initialise Stripe SDK ─────────────────────────────────────────────────────
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY", "")

# ── Chapa API base URL ────────────────────────────────────────────────────────
CHAPA_INIT_URL   = "https://api.chapa.co/v1/transaction/initialize"
CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify/{tx_ref}"


def confirm_booking(booking_id):
    """
    Atomically confirms a booking (PENDING → CONFIRMED) and reserves its
    seats against the linked Availability — exactly once, no matter how many
    of the four confirmation paths (Stripe confirm, Stripe webhook, Chapa
    verify, Chapa webhook) end up calling this for the same booking.

    Guarded by select_for_update() + a PENDING check inside one transaction:
    whichever caller gets there first does the work; any later/duplicate
    caller (e.g. webhook firing after the frontend already confirmed) finds
    the booking no longer PENDING and is a safe no-op.

    NOTE — known tradeoff: seats are only reserved at payment confirmation,
    not at booking creation, per your request (this avoids permanently
    losing seats to abandoned/never-paid carts). The flip side is that two
    people can both hold a PENDING booking against the same last seat at the
    same time, and both could end up confirmed if they pay around the same
    moment — booked_seats is capped at total_seats here so the count itself
    can never go negative or over-display, but this does NOT prevent an
    actual oversell in that race scenario. If that matters for your
    business (e.g. very small group tours), the standard fix is a
    short-lived seat hold created at booking time that expires if unpaid —
    happy to add that if you want it.
    """
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(id=booking_id)
        if booking.status != Booking.Status.PENDING:
            return booking  # already confirmed (or cancelled) elsewhere — no-op

        booking.status = Booking.Status.CONFIRMED
        booking.save(update_fields=["status", "updated_at"])

        if booking.availability_id:
            avail = Availability.objects.select_for_update().get(id=booking.availability_id)
            avail.booked_seats = min(avail.booked_seats + booking.total_guests, avail.total_seats)
            avail.save(update_fields=["booked_seats"])

        return booking

# ETB is the primary currency for this business (Chapa's native currency,
# and what customers actually see/pay). total_price_usd is what's physically
# stored on Booking (tour packages are priced in USD by staff in the admin),
# but conceptually the ETB figure is the ground truth a customer pays, and
# USD is what gets derived FROM it — at a live rate, not a fixed one — for
# international Stripe cardholders. See models.get_usd_to_etb_rate() for the
# live-rate-with-fallback implementation shared by both gateways so they
# can't drift apart.


def usd_to_etb(amount_usd):
    rate = get_usd_to_etb_rate()
    return (Decimal(amount_usd) * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ══════════════════════════════════════════════════════════════════════════════
#  STRIPE
# ══════════════════════════════════════════════════════════════════════════════

class CreateStripePaymentIntentView(APIView):
    """
    POST /api/v1/bookings/payment/stripe/create-intent/

    Creates a Stripe PaymentIntent on the server and returns client_secret.
    The browser uses client_secret to confirm the card without card data
    ever touching our server (PCI compliance).

    Request:  { "booking_reference": "ETT-ABC123", "currency": "usd" }  (currency optional, defaults to usd)
    Response: { "client_secret": "pi_xxx_secret_xxx",
                "payment_intent_id": "pi_xxx",
                "amount_cents": 120000,
                "currency": "usd" }

    NOTE on ETB: Stripe's API accepts "etb" as a currency code, but whether
    it's actually usable depends on your Stripe account's country/settings —
    Ethiopian Birr has FX restrictions and isn't enabled as a presentment
    currency for every account. Verify in Stripe Dashboard → Settings →
    Business settings → Presentment currencies before relying on this in
    production. If it's not enabled there, Stripe will reject the intent
    with a currency-not-supported error even though this code sends it fine.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ref = request.data.get("booking_reference", "").strip()
        if not ref:
            return Response(
                {"error": "booking_reference is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_currency = (request.data.get("currency") or "usd").strip().lower()
        if requested_currency not in ("usd", "etb"):
            return Response({"error": "currency must be 'usd' or 'etb'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(reference=ref, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != Booking.Status.PENDING:
            return Response(
                {"error": f"Booking is already '{booking.status}'. No further payment needed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ETB is the primary/native amount (what Chapa actually charges,
        # and what the customer sees as the real price). For Stripe, USD is
        # DERIVED from that ETB figure at the current live rate — not the
        # other way around — even though total_price_usd happens to be the
        # field physically stored on the row. Fetching the rate once here
        # and using it for both directions keeps this request internally
        # consistent even if the live rate ticks between requests.
        rate = get_usd_to_etb_rate()
        etb_amount = (booking.total_price_usd * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Stripe amounts must be in the smallest unit (cents for both USD and ETB)
        if requested_currency == "etb":
            amount_cents = int(etb_amount * 100)
        else:
            usd_amount = (etb_amount / rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            amount_cents = int(usd_amount * 100)

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=requested_currency,
                automatic_payment_methods={"enabled": True},
                metadata={
                    "booking_reference": booking.reference,
                    "booking_id":        str(booking.id),
                    "user_email":        request.user.email,
                    "tour":              booking.tour_package.title,
                },
                description=f"Ethiopia Tour & Travel — {booking.tour_package.title}",
                receipt_email=booking.contact_email,
            )
        except stripe.error.CardError as e:
            return Response({"error": e.user_message}, status=status.HTTP_402_PAYMENT_REQUIRED)
        except stripe.error.StripeError as e:
            return Response({"error": str(e.user_message)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            "client_secret":     intent.client_secret,
            "payment_intent_id": intent.id,
            "amount_cents":      amount_cents,
            "currency":          requested_currency,
        })


class ConfirmStripePaymentView(APIView):
    """
    POST /api/v1/bookings/payment/stripe/confirm/

    Called AFTER Stripe.js has confirmed the card in the browser.
    We ALWAYS retrieve the PaymentIntent from Stripe's API to verify
    its real status — never trust data sent from the frontend alone.

    Request:  { "payment_intent_id": "pi_xxx",
                "booking_reference": "ETT-ABC123" }
    Response: { "success": true, "booking_reference": "...", "status": "confirmed" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        intent_id = request.data.get("payment_intent_id", "").strip()
        ref       = request.data.get("booking_reference",  "").strip()

        if not intent_id or not ref:
            return Response(
                {"error": "Both payment_intent_id and booking_reference are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking = Booking.objects.get(reference=ref, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        # Verify with Stripe — do NOT trust client data
        try:
            intent = stripe.PaymentIntent.retrieve(intent_id)
        except stripe.error.StripeError as e:
            return Response({"error": str(e.user_message)}, status=status.HTTP_502_BAD_GATEWAY)

        if intent.status == "succeeded":
            booking = confirm_booking(booking.id)

            # get_or_create prevents duplicates if webhook already fired.
            # currency/charged_amount come straight from Stripe's own
            # verified intent — not from whatever the frontend requested —
            # since intent.amount/intent.currency is what was actually
            # charged.
            Payment.objects.get_or_create(
                booking=booking,
                transaction_id=intent_id,
                defaults={
                    "method":         Payment.Method.STRIPE,
                    "status":         Payment.PaymentStatus.SUCCESS,
                    "amount_usd":     booking.total_price_usd,
                    "currency":       intent.currency,
                    "charged_amount": Decimal(intent.amount) / 100,
                    "paid_at":        timezone.now(),
                },
            )
            return Response({
                "success":           True,
                "booking_reference": booking.reference,
                "status":            booking.status,
                "message":           "Payment confirmed. Your tour is booked!",
            })

        return Response({
            "success":       False,
            "intent_status": intent.status,
            "message":       "Payment not yet completed.",
        }, status=status.HTTP_402_PAYMENT_REQUIRED)


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    """
    POST /api/v1/bookings/payment/stripe/webhook/

    Stripe sends signed events here after payment actions.
    Signature is verified using STRIPE_WEBHOOK_SECRET before processing.

    ── Local testing with Stripe CLI ────────────────────────────────────────
    1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
       Mac:     brew install stripe/stripe-cli/stripe
       Windows: scoop install stripe
       Linux:   see https://stripe.com/docs/stripe-cli#install

    2. Log in:
       stripe login

    3. Forward webhooks to your local Django server:
       stripe listen --forward-to localhost:8000/api/v1/bookings/payment/stripe/webhook/

    4. The CLI prints a webhook signing secret like:
       > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)

    5. Copy that secret into your .env:
       STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

    6. In a SEPARATE terminal, run Django:
       python manage.py runserver

    7. Trigger a test event:
       stripe trigger payment_intent.succeeded

    ── Handled events ───────────────────────────────────────────────────────
    payment_intent.succeeded      → confirm booking
    payment_intent.payment_failed → mark payment failed
    """
    permission_classes = []   # Public — secured by Stripe HMAC signature

    def post(self, request):
        payload    = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        wh_secret  = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, wh_secret)
        except ValueError:
            return Response({"error": "Invalid payload."}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response({"error": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        obj = event["data"]["object"]

        if event["type"] == "payment_intent.succeeded":
            ref = obj.get("metadata", {}).get("booking_reference", "")
            if ref:
                try:
                    booking = Booking.objects.get(reference=ref)
                    booking = confirm_booking(booking.id)
                    Payment.objects.get_or_create(
                        booking=booking,
                        transaction_id=obj["id"],
                        defaults={
                            "method":         Payment.Method.STRIPE,
                            "status":         Payment.PaymentStatus.SUCCESS,
                            "amount_usd":     booking.total_price_usd,
                            "currency":       obj.get("currency", "usd"),
                            "charged_amount": Decimal(obj.get("amount", 0)) / 100,
                            "paid_at":        timezone.now(),
                        },
                    )
                except Booking.DoesNotExist:
                    pass

        elif event["type"] == "payment_intent.payment_failed":
            ref = obj.get("metadata", {}).get("booking_reference", "")
            if ref:
                Payment.objects.filter(
                    booking__reference=ref, transaction_id=obj["id"]
                ).update(status=Payment.PaymentStatus.FAILED)

        return Response({"received": True})


# ══════════════════════════════════════════════════════════════════════════════
#  CHAPA (Telebirr + CBE Birr + Amole + cards — all via unified checkout)
# ══════════════════════════════════════════════════════════════════════════════

class ChapaInitializeView(APIView):
    """
    POST /api/v1/bookings/payment/chapa/initialize/

    Calls the Chapa API to create a payment session.
    Returns checkout_url — redirect the user to this URL.
    On the Chapa page, user picks Telebirr / CBE Birr / Amole / card.

    ── Local testing with ngrok ──────────────────────────────────────────────
    Chapa needs a real HTTPS URL to send webhooks. Use ngrok locally:

    1. Install ngrok: https://ngrok.com/download
       Mac:     brew install ngrok
       Windows: download exe from ngrok.com
       Linux:   snap install ngrok

    2. Sign up for a free ngrok account at https://ngrok.com
       Then authenticate:  ngrok config add-authtoken YOUR_NGROK_TOKEN

    3. In a terminal, expose your local Django server:
       ngrok http 8000

    4. ngrok prints a public URL like:
       Forwarding   https://abc123.ngrok-free.app -> http://localhost:8000

    5. Copy the https URL and set in your .env:
       BACKEND_URL=https://abc123.ngrok-free.app

    6. In Chapa Dashboard → Settings → Webhooks → Add Webhook:
       URL:    https://abc123.ngrok-free.app/api/v1/bookings/payment/chapa/webhook/
       Secret: the value you set in CHAPA_WEBHOOK_SECRET

    7. For return_url (where user lands after paying), also set:
       FRONTEND_URL=http://localhost:5173
       (Chapa will redirect to: http://localhost:5173/booking-success/{ref}?tx_ref=...)

    8. Run Django in a SEPARATE terminal:
       python manage.py runserver

    9. Test payment with Chapa test credentials:
       Phone:  0912345678
       PIN:    123456
       OTP:    123456

    ── Chapa API reference ───────────────────────────────────────────────────
    POST https://api.chapa.co/v1/transaction/initialize
    Authorization: Bearer {CHAPA_SECRET_KEY}

    Request:  { "booking_reference": "ETT-ABC123", "currency": "ETB" }  (currency optional, defaults to ETB)
    Response: { "checkout_url": "https://checkout.chapa.co/...",
                "tx_ref": "ETT-ABC123-1700000000" }

    NOTE on currency: this defaults to ETB now. The earlier "USD" default
    caused Chapa's hosted checkout page to crash on load (its own JS threw
    trying to render an empty payment-method list) — the account had no
    payment methods enabled for USD. ETB is Chapa's native currency and is
    virtually always enabled. Pass "USD" explicitly only after confirming
    in the Chapa Dashboard that USD methods are actually turned on.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ref = request.data.get("booking_reference", "").strip()
        if not ref:
            return Response(
                {"error": "booking_reference is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_currency = (request.data.get("currency") or "ETB").strip().upper()
        if requested_currency not in ("ETB", "USD"):
            return Response({"error": "currency must be 'ETB' or 'USD'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(reference=ref, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != Booking.Status.PENDING:
            return Response(
                {"error": f"Booking is already '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build a unique tx_ref — append timestamp so retries work
        import time
        tx_ref = f"{booking.reference}-{int(time.time())}"

        backend_url  = getattr(settings, "BACKEND_URL",  "http://localhost:8000")
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

        # booking.total_price_usd is always stored in USD — convert to ETB for
        # the actual charge amount if that's the currency being sent to Chapa.
        charge_amount = usd_to_etb(booking.total_price_usd) if requested_currency == "ETB" else booking.total_price_usd

        # Optional fail-fast guard: many Chapa accounts (sandbox, or before
        # business/KYC verification) are capped at a low per-transaction
        # amount — Chapa's API just rejects with "amount must not be greater
        # than {N}" once you hit it. Set CHAPA_MAX_AMOUNT in settings.py once
        # you know your account's real cap, to get an immediate, clear error
        # here instead of a round trip to Chapa. Unset (None) by default —
        # skipped entirely until you configure it.
        max_amount = getattr(settings, "CHAPA_MAX_AMOUNT", None)
        if max_amount is not None and charge_amount > Decimal(str(max_amount)):
            return Response(
                {"error": (
                    f"This booking's amount ({charge_amount} {requested_currency}) exceeds your "
                    f"Chapa account's current transaction limit ({max_amount} {requested_currency}). "
                    "Contact Chapa support to raise your account's limit (usually requires business "
                    "verification)."
                )},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Chapa expects a clean 10-digit local Ethiopian format (e.g. "0967543232").
        # contact_phone as typed by the user can be "+251 967543232", "251967543232",
        # "0967543232", with spaces/dashes, etc. — any of that gets rejected by
        # Chapa's API with a 400, which is the most common cause of this endpoint
        # failing. Normalize it before sending.
        import re
        digits = re.sub(r"\D", "", booking.contact_phone or "")
        if digits.startswith("251"):
            digits = "0" + digits[3:]
        elif not digits.startswith("0"):
            digits = "0" + digits
        phone_number = digits

        # Chapa's customization.title (≤16 chars) and customization.description
        # (≤50 chars) also only allow letters, numbers, hyphens, underscores,
        # spaces, and dots — no "&" or other punctuation. The previous fixed
        # title ("Ethiopia Tour & Travel", 22 chars, contains "&") and the
        # unbounded description built straight from the tour title both broke
        # these rules. Sanitize + truncate both before sending.
        def _chapa_safe(text, max_len):
            cleaned = re.sub(r"[^A-Za-z0-9\-_ .]", "", text or "")
            cleaned = re.sub(r"\s+", " ", cleaned).strip()
            return cleaned[:max_len] or "Tour Booking"[:max_len]

        chapa_title       = _chapa_safe("Ethiopia Tours", 16)
        chapa_description = _chapa_safe(f"Booking for {booking.tour_package.title}", 50)

        payload = {
            "amount":       str(charge_amount),
            "currency":     requested_currency,
            "email":        booking.contact_email,
            "first_name":   booking.user.first_name,
            "last_name":    booking.user.last_name,
            "phone_number": phone_number,
            "tx_ref":       tx_ref,
            # Chapa calls this URL with a POST after payment succeeds
            "callback_url": f"{backend_url}/api/v1/bookings/payment/chapa/webhook/",
            # User is redirected here after completing payment on Chapa page
            "return_url":   f"{frontend_url}/booking-success/{booking.reference}?tx_ref={tx_ref}",
            "customization": {
                "title":       chapa_title,
                "description": chapa_description,
            },
        }

        headers = {
            "Authorization": f"Bearer {getattr(settings, 'CHAPA_SECRET_KEY', '')}",
            "Content-Type":  "application/json",
        }

        # IMPORTANT: don't call resp.raise_for_status() before reading the body —
        # Chapa returns a JSON error payload with the *actual* validation reason
        # (e.g. "Invalid phone number", "amount is required") even on 400/422.
        # raise_for_status() throws immediately and discards that body, leaving
        # only a generic "400 Client Error: Bad Request for url: ..." — which is
        # useless for debugging and is exactly what was being returned before.
        try:
            resp = requests.post(CHAPA_INIT_URL, json=payload, headers=headers, timeout=15)
        except requests.Timeout:
            return Response(
                {"error": "Chapa API timed out. Please try again."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except requests.RequestException as e:
            return Response(
                {"error": f"Chapa API error: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            data = resp.json()
        except ValueError:
            return Response(
                {"error": f"Chapa API returned a non-JSON response (HTTP {resp.status_code})."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if data.get("status") != "success":
            # Surface Chapa's real message (e.g. field-level validation errors)
            # instead of a generic failure.
            reason = data.get("message") or data.get("data") or "Chapa initialization failed."
            return Response(
                {"error": reason if isinstance(reason, str) else str(reason)},
                status=status.HTTP_400_BAD_REQUEST if resp.status_code < 500 else status.HTTP_502_BAD_GATEWAY,
            )

        checkout_url = data["data"]["checkout_url"]

        # Record a pending Chapa payment so the webhook can match it
        Payment.objects.create(
            booking=booking,
            method=Payment.Method.CHAPA,
            status=Payment.PaymentStatus.PENDING,
            amount_usd=booking.total_price_usd,
            currency=requested_currency.lower(),
            charged_amount=charge_amount,
            transaction_id=tx_ref,
        )

        return Response({
            "checkout_url": checkout_url,
            "tx_ref":       tx_ref,
            "charged_amount": str(charge_amount),
            "charged_currency": requested_currency,
        })


class ChapaVerifyView(APIView):
    """
    GET /api/v1/bookings/payment/chapa/verify/{tx_ref}/

    Called by the frontend when the user lands on /booking-success/ after
    being redirected back from Chapa. We call Chapa's verify endpoint to
    confirm the payment actually succeeded — never trust the URL alone.

    This is the backup confirmation path. The primary path is the webhook.

    Chapa verify API:
        GET https://api.chapa.co/v1/transaction/verify/{tx_ref}
        Authorization: Bearer {CHAPA_SECRET_KEY}
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tx_ref):
        headers = {"Authorization": f"Bearer {getattr(settings, 'CHAPA_SECRET_KEY', '')}"}

        try:
            resp = requests.get(
                CHAPA_VERIFY_URL.format(tx_ref=tx_ref),
                headers=headers,
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        if data.get("status") != "success":
            return Response(
                {"success": False, "message": "Transaction not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        chapa_data = data.get("data", {})
        tx_status  = chapa_data.get("status", "")

        # tx_ref format: "ETT-ABC123-{timestamp}" — extract booking ref
        # Split on last hyphen-digit-sequence to get the booking reference
        parts = tx_ref.rsplit("-", 1)
        booking_ref = parts[0] if len(parts) == 2 and parts[1].isdigit() else tx_ref

        if tx_status == "success":
            try:
                booking = Booking.objects.get(reference=booking_ref, user=request.user)
            except Booking.DoesNotExist:
                return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

            booking = confirm_booking(booking.id)

            Payment.objects.filter(
                booking=booking, transaction_id=tx_ref
            ).update(status=Payment.PaymentStatus.SUCCESS, paid_at=timezone.now())

            return Response({
                "success":           True,
                "booking_reference": booking_ref,
                "status":            "confirmed",
                "message":           "Payment verified. Booking confirmed!",
            })

        return Response({
            "success":   False,
            "tx_status": tx_status,
            "message":   f"Payment status is '{tx_status}'.",
        }, status=status.HTTP_402_PAYMENT_REQUIRED)


@method_decorator(csrf_exempt, name="dispatch")
class ChapaWebhookView(APIView):
    """
    POST /api/v1/bookings/payment/chapa/webhook/

    Chapa POSTs here after a successful payment (callback_url).
    Signature is verified using HMAC SHA256 before processing.

    ── Setting up the webhook in Chapa Dashboard ─────────────────────────────
    URL to enter: https://YOUR-NGROK-URL/api/v1/bookings/payment/chapa/webhook/
    (Use ngrok for local testing — see ChapaInitializeView docstring above)

    Chapa sends header: "x-chapa-signature" = HMAC-SHA256(body, secret)

    ── Webhook payload (on success) ─────────────────────────────────────────
    {
        "event":  "charge.success",
        "tx_ref": "ETT-ABC123-1700000000",
        "status": "success",
        "amount": "1200.00",
        "currency": "USD"
    }
    """
    permission_classes = []  # Public — secured by HMAC signature

    def post(self, request):
        # ── 1. Verify HMAC signature ──────────────────────────────────────
        sig    = request.META.get("HTTP_X_CHAPA_SIGNATURE", "")
        secret = getattr(settings, "CHAPA_WEBHOOK_SECRET", "")

        if secret and sig:
            expected = hmac.new(
                secret.encode("utf-8"),
                request.body,
                hashlib.sha256,
            ).hexdigest()
            if not hmac.compare_digest(expected, sig):
                return Response({"error": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        # ── 2. Parse body ─────────────────────────────────────────────────
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON body."}, status=status.HTTP_400_BAD_REQUEST)

        event     = payload.get("event",  "")
        tx_ref    = payload.get("tx_ref", "")
        tx_status = payload.get("status", "")

        # ── 3. Process successful payment ─────────────────────────────────
        if event == "charge.success" and tx_status == "success" and tx_ref:
            # Extract booking reference from tx_ref (format: "ETT-ABC123-{timestamp}")
            parts = tx_ref.rsplit("-", 1)
            booking_ref = parts[0] if len(parts) == 2 and parts[1].isdigit() else tx_ref

            try:
                booking = Booking.objects.get(reference=booking_ref)
                booking = confirm_booking(booking.id)

                Payment.objects.filter(
                    booking=booking, transaction_id=tx_ref
                ).update(status=Payment.PaymentStatus.SUCCESS, paid_at=timezone.now())

            except Booking.DoesNotExist:
                # Log this in production (booking may have been deleted)
                pass

        # Always return 200 — Chapa retries if it gets any other status
        return Response({"received": True})


# ══════════════════════════════════════════════════════════════════════════════
#  SHARED
# ══════════════════════════════════════════════════════════════════════════════

class ExchangeRateView(APIView):
    """
    GET /api/v1/bookings/payment/exchange-rate/

    Returns the live USD→ETB rate this backend is currently using (from
    get_usd_to_etb_rate() — cached live fetch with a static fallback; see
    models.py), and, if ?booking_reference=... is passed AND the caller is
    authenticated as that booking's owner, that booking's total in both
    currencies.

    Publicly readable (no login required) — package listing/detail pages
    need to show converted ETB prices to browsing visitors who haven't
    logged in yet, not just to someone mid-checkout.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ref = request.query_params.get("booking_reference", "").strip()
        rate = get_usd_to_etb_rate()
        payload = {"usd_to_etb": str(rate)}

        if ref:
            if not request.user.is_authenticated:
                return Response({"error": "Login required to view this booking's total."},
                                 status=status.HTTP_401_UNAUTHORIZED)
            try:
                booking = Booking.objects.get(reference=ref, user=request.user)
            except Booking.DoesNotExist:
                return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
            payload["total_usd"] = str(booking.total_price_usd)
            payload["total_etb"] = str(usd_to_etb(booking.total_price_usd))

        return Response(payload)