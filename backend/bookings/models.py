import uuid
from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from packages.models import TourPackage, Availability

from .exchange_rates import get_usd_to_etb_rate  # noqa: F401

def generate_booking_ref():
    return f"ETT-{uuid.uuid4().hex[:6].upper()}"

class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FIXED      = "fixed",      "Fixed Amount (USD)"

    code           = models.CharField(max_length=50, unique=True)
    discount_type  = models.CharField(max_length=15, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_usd  = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_uses       = models.PositiveIntegerField(null=True, blank=True)
    used_count     = models.PositiveIntegerField(default=0)
    valid_from     = models.DateField()
    valid_until    = models.DateField()
    is_active      = models.BooleanField(default=True)
    def __str__(self): return f"{self.code} ({self.discount_value} {self.discount_type})"

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING   = "pending",   "Pending Payment"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"
        REFUNDED  = "refunded",  "Refunded"

    reference    = models.CharField(max_length=20, unique=True, default=generate_booking_ref)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings")
    tour_package = models.ForeignKey(TourPackage, on_delete=models.PROTECT, related_name="bookings")
    availability = models.ForeignKey(Availability, on_delete=models.PROTECT, null=True, blank=True)
    start_date   = models.DateField()
    end_date     = models.DateField()
    num_adults   = models.PositiveSmallIntegerField(default=1)
    num_children = models.PositiveSmallIntegerField(default=0)
    unit_price_usd  = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price_usd = models.DecimalField(max_digits=10, decimal_places=2)
    coupon         = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    contact_name   = models.CharField(max_length=200)
    contact_email  = models.EmailField()
    contact_phone  = models.CharField(max_length=30)
    special_requests = models.TextField(blank=True)
    status         = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    admin_notes    = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self): return f"Booking {self.reference} — {self.tour_package.title}"

    @property
    def total_guests(self):
        return self.num_adults + self.num_children

    @property
    def total_price_etb(self):
        # ETB is the primary currency Chapa actually charges in — this is
        # the number the customer sees and pays. USD (total_price_usd) is
        # what Stripe charges internationally, and is derived FROM this ETB
        # figure at the current live rate, not the other way around, even
        # though total_price_usd happens to be the field physically stored
        # on the row (package prices are entered in USD by staff — see
        # TourPackage.price_usd in the admin). Mathematically the two are
        # just two views of the same amount at today's rate.
        rate = get_usd_to_etb_rate(provider="chapa")
        return (self.total_price_usd * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

class BookingGuest(models.Model):
    booking    = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="guests")
    first_name = models.CharField(max_length=100)
    last_name  = models.CharField(max_length=100)
    age        = models.PositiveSmallIntegerField(null=True, blank=True)
    passport   = models.CharField(max_length=50, blank=True)

class Payment(models.Model):
    class Method(models.TextChoices):
        STRIPE = "stripe", "Stripe (Card)"
        CHAPA  = "chapa",  "Chapa"
    class PaymentStatus(models.TextChoices):
        PENDING  = "pending",  "Pending"
        SUCCESS  = "success",  "Successful"
        FAILED   = "failed",   "Failed"
        REFUNDED = "refunded", "Refunded"
    class Currency(models.TextChoices):
        USD = "usd", "US Dollar"
        ETB = "etb", "Ethiopian Birr"

    booking        = models.ForeignKey(Booking, on_delete=models.PROTECT, related_name="payments")
    method         = models.CharField(max_length=15, choices=Method.choices)
    status         = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    # amount_usd is the internal ledger value — always USD, used for
    # reporting/reconciliation regardless of what currency the customer
    # actually paid in.
    amount_usd     = models.DecimalField(max_digits=10, decimal_places=2)
    # currency/charged_amount record what was ACTUALLY charged to the
    # customer (e.g. a Chapa payment charged in ETB is a different number
    # than amount_usd — previously this was never stored anywhere, so there
    # was no record of the real amount once converted).
    currency       = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    charged_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True)
    paid_at        = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)