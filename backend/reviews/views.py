from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from .models import Review
from .serializers import ReviewSerializer

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [permissions.IsAuthenticated()]
    def get_queryset(self):
        qs = Review.objects.filter(is_approved=True).select_related("user","tour_package")
        pkg = self.request.query_params.get("package")
        if pkg: qs = qs.filter(tour_package__slug=pkg)
        return qs
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TestimonialsView(generics.ListAPIView):
    serializer_class = ReviewSerializer; permission_classes = [AllowAny]
    def get_queryset(self):
        return Review.objects.filter(is_approved=True, is_featured=True).select_related("user")[:6]
