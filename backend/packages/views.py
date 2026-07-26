from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import TourPackage, Availability
from .serializers import TourPackageListSerializer, TourPackageDetailSerializer, AvailabilitySerializer

class TourPackageListView(generics.ListAPIView):
    serializer_class   = TourPackageListSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ["category","difficulty","featured"]
    search_fields      = ["title","tagline","overview","destinations__name"]
    ordering_fields    = ["price_usd","duration_days","created_at"]
    def get_queryset(self):
        qs = TourPackage.objects.filter(is_active=True, is_private=False).prefetch_related("destinations")
        for key, field in [("min_price","price_usd__gte"),("max_price","price_usd__lte"),("max_days","duration_days__lte")]:
            v = self.request.query_params.get(key)
            if v: qs = qs.filter(**{field: v})
        return qs

class FeaturedPackagesView(generics.ListAPIView):
    serializer_class   = TourPackageListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return TourPackage.objects.filter(is_active=True, featured=True).prefetch_related("destinations")[:6]

class TourPackageDetailView(generics.RetrieveAPIView):
    serializer_class   = TourPackageDetailSerializer
    permission_classes = [AllowAny]
    lookup_field       = "slug"
    def get_queryset(self):
        return TourPackage.objects.filter(is_active=True).prefetch_related("destinations","itinerary","images","availability")

class PackageAvailabilityView(generics.ListAPIView):
    serializer_class   = AvailabilitySerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return Availability.objects.filter(package__slug=self.kwargs["slug"], is_active=True).order_by("start_date")
