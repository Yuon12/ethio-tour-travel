from django.urls import path
from .views import ReviewListCreateView, TestimonialsView

urlpatterns = [
    path("",              ReviewListCreateView.as_view(), name="review-list-create"),
    path("testimonials/", TestimonialsView.as_view(),     name="testimonials"),
]
