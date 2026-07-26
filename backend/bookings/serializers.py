from rest_framework import serializers
from django.utils import timezone
from .models import Booking, BookingGuest, Payment, Coupon

class BookingGuestSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BookingGuest
        fields = ["id","first_name","last_name","age","passport"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ["id","method","status","amount_usd","transaction_id","paid_at"]

class BookingCreateSerializer(serializers.ModelSerializer):
    guests = BookingGuestSerializer(many=True, required=False)

    class Meta:
        model  = Booking
        fields = [
            # ── writable input fields ──
            "tour_package","availability","start_date","end_date",
            "num_adults","num_children","contact_name","contact_email",
            "contact_phone","special_requests","coupon","guests",
            # ── read-only fields the frontend needs back immediately after
            #    create: the wizard uses `reference` to call the payment
            #    endpoints, and `total_price_usd`/`status` to render the
            #    payment step's summary and confirmation screen. These were
            #    missing entirely, so POST /bookings/ never returned them —
            #    which is why booking_reference showed up as undefined on
            #    the very next request.
            "id","reference","status","unit_price_usd","discount_amount","total_price_usd","total_price_etb",
        ]
        read_only_fields = ["id","reference","status","unit_price_usd","discount_amount","total_price_usd","total_price_etb"]

    def validate(self, attrs):
        if attrs["start_date"] < timezone.now().date():
            raise serializers.ValidationError({"start_date": "Start date must be in the future."})
        avail = attrs.get("availability")
        if avail:
            total = attrs.get("num_adults",1) + attrs.get("num_children",0)
            if total > avail.available_seats:
                raise serializers.ValidationError(f"Only {avail.available_seats} seats available.")
        return attrs

    def create(self, validated_data):
        guests_data  = validated_data.pop("guests", [])
        coupon       = validated_data.get("coupon")
        tour_package = validated_data["tour_package"]
        num_adults   = validated_data.get("num_adults", 1)
        num_children = validated_data.get("num_children", 0)
        unit_price   = tour_package.effective_price
        subtotal     = unit_price * (num_adults + num_children)
        discount     = 0
        if coupon and coupon.is_active:
            if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
                discount = subtotal * (coupon.discount_value / 100)
            else:
                discount = min(coupon.discount_value, subtotal)
        booking = Booking.objects.create(
            **validated_data,
            user=self.context["request"].user,
            unit_price_usd=unit_price,
            discount_amount=discount,
            total_price_usd=subtotal - discount,
        )
        for g in guests_data:
            BookingGuest.objects.create(booking=booking, **g)
        return booking

class BookingListSerializer(serializers.ModelSerializer):
    package_title = serializers.CharField(source="tour_package.title", read_only=True)
    package_slug  = serializers.CharField(source="tour_package.slug", read_only=True)
    total_guests  = serializers.ReadOnlyField()
    class Meta:
        model  = Booking
        fields = ["id","reference","package_title","package_slug","start_date","end_date","total_guests","total_price_usd","total_price_etb","status","created_at"]

class BookingDetailSerializer(serializers.ModelSerializer):
    guests        = BookingGuestSerializer(many=True, read_only=True)
    payments      = PaymentSerializer(many=True, read_only=True)
    package_title = serializers.CharField(source="tour_package.title", read_only=True)
    package_cover = serializers.ImageField(source="tour_package.cover_image", read_only=True)
    total_guests  = serializers.ReadOnlyField()
    class Meta:
        model  = Booking
        fields = ["id","reference","package_title","package_cover","start_date","end_date",
                  "num_adults","num_children","total_guests","contact_name","contact_email",
                  "contact_phone","special_requests","unit_price_usd","discount_amount",
                  "total_price_usd","total_price_etb","coupon","status","admin_notes","guests","payments","created_at","updated_at"]