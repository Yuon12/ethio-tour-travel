from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from packages.models import TourPackage

class Review(models.Model):
    tour_package        = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="reviews")
    user                = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="reviews")
    rating              = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title               = models.CharField(max_length=200)
    content             = models.TextField()
    score_guide         = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    score_accommodation = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    score_value         = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    score_transport     = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    is_approved         = models.BooleanField(default=False)
    is_featured         = models.BooleanField(default=False)
    created_at          = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]; unique_together = ["tour_package","user"]
    def __str__(self): return f"{self.rating}★ — {self.tour_package.title}"
