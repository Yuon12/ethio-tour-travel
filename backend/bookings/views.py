from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Booking, Coupon
from .serializers import BookingCreateSerializer, BookingListSerializer, BookingDetailSerializer

class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_class(self):
        return BookingCreateSerializer if self.request.method == "POST" else BookingListSerializer
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related("tour_package")

class BookingDetailView(generics.RetrieveAPIView):
    serializer_class   = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field       = "reference"
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).prefetch_related("guests","payments")

class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        code     = request.data.get("code","").strip().upper()
        subtotal = float(request.data.get("subtotal", 0))
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid coupon code."}, status=status.HTTP_404_NOT_FOUND)
        today = timezone.now().date()
        if not (coupon.valid_from <= today <= coupon.valid_until):
            return Response({"error": "Coupon has expired."}, status=status.HTTP_400_BAD_REQUEST)
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            return Response({"error": "Coupon usage limit reached."}, status=status.HTTP_400_BAD_REQUEST)
        if subtotal < float(coupon.min_order_usd):
            return Response({"error": f"Minimum order is ${coupon.min_order_usd}."}, status=status.HTTP_400_BAD_REQUEST)
        discount = subtotal * (float(coupon.discount_value)/100) if coupon.discount_type == Coupon.DiscountType.PERCENTAGE else min(float(coupon.discount_value), subtotal)
        return Response({"valid": True, "code": coupon.code, "discount_type": coupon.discount_type, "discount_value": coupon.discount_value, "discount_amount": round(discount,2), "total_after_discount": round(subtotal-discount,2)})
