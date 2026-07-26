from django.contrib import admin
from .models import Booking, BookingGuest, Payment, Coupon

class BookingGuestInline(admin.TabularInline):
    model = BookingGuest; extra = 0
class PaymentInline(admin.TabularInline):
    model = Payment; extra = 0

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display    = ["reference","user","tour_package","start_date","total_price_usd","status","created_at"]
    list_filter     = ["status","created_at"]
    search_fields   = ["reference","contact_email","contact_name"]
    readonly_fields = ["reference","created_at","updated_at"]
    inlines = [BookingGuestInline, PaymentInline]

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["code","discount_type","discount_value","used_count","valid_from","valid_until","is_active"]
