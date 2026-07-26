from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["tour_package","user","rating","is_approved","is_featured","created_at"]
    list_filter  = ["rating","is_approved","is_featured"]
    actions      = ["approve_reviews","feature_reviews"]
    def approve_reviews(self, request, queryset): queryset.update(is_approved=True)
    def feature_reviews(self, request, queryset): queryset.update(is_featured=True)
