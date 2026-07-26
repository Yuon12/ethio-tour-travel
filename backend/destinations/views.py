from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Region, Destination
from .serializers import RegionSerializer, DestinationListSerializer, DestinationDetailSerializer

class RegionListView(generics.ListAPIView):
    queryset           = Region.objects.filter(is_active=True)
    serializer_class   = RegionSerializer
    permission_classes = [AllowAny]

class DestinationListView(generics.ListAPIView):
    serializer_class   = DestinationListSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ["region__slug","featured"]
    search_fields      = ["name","tagline","description","region__name"]
    ordering_fields    = ["name","created_at"]
    def get_queryset(self):
        return Destination.objects.filter(is_active=True).select_related("region")

class DestinationDetailView(generics.RetrieveAPIView):
    serializer_class   = DestinationDetailSerializer
    permission_classes = [AllowAny]
    lookup_field       = "slug"
    def get_queryset(self):
        return Destination.objects.filter(is_active=True).select_related("region").prefetch_related("images","nearby_attractions")

class FeaturedDestinationsView(generics.ListAPIView):
    serializer_class   = DestinationListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return Destination.objects.filter(is_active=True, featured=True).select_related("region")[:6]
