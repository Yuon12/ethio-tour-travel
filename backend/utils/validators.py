"""Custom validators."""
from django.core.exceptions import ValidationError
from django.utils import timezone

def validate_future_date(value):
    if value < timezone.now().date():
        raise ValidationError("Date must be in the future.")

def validate_positive_price(value):
    if value <= 0:
        raise ValidationError("Price must be greater than zero.")
