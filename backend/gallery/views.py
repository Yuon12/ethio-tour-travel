from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Album, Media
from .serializers import AlbumListSerializer, AlbumDetailSerializer, MediaSerializer

class AlbumListView(generics.ListAPIView):
    queryset = Album.objects.filter(is_active=True); serializer_class = AlbumListSerializer; permission_classes = [AllowAny]

class AlbumDetailView(generics.RetrieveAPIView):
    queryset = Album.objects.filter(is_active=True).prefetch_related("media_items"); serializer_class = AlbumDetailSerializer; permission_classes = [AllowAny]; lookup_field = "slug"

class FeaturedMediaView(generics.ListAPIView):
    serializer_class = MediaSerializer; permission_classes = [AllowAny]
    def get_queryset(self):
        return Media.objects.filter(is_featured=True).order_by("order")[:12]
