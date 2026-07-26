# ==========================================
# packages/models.py
# ==========================================
from django.db import models
from django.utils.text import slugify
from destinations.models import Destination
from i18n_content.translate_service import translate_missing_fields


class TourPackage(models.Model):
    class DifficultyLevel(models.TextChoices):
        EASY     = "easy",     "Easy"
        MODERATE = "moderate", "Moderate"
        HARD     = "hard",     "Hard"
        EXTREME  = "extreme",  "Extreme"

    class TourCategory(models.TextChoices):
        ADVENTURE  = "adventure",  "Adventure"
        LUXURY     = "luxury",     "Luxury"
        FAMILY     = "family",     "Family"
        WILDLIFE   = "wildlife",   "Wildlife"
        HISTORICAL = "historical", "Historical"
        TREKKING   = "trekking",   "Trekking"
        BIRDWATCH  = "birdwatch",  "Bird Watching"

    title              = models.CharField(max_length=255)
    slug               = models.SlugField(max_length=280, unique=True, blank=True)
    tagline            = models.CharField(max_length=300, blank=True)
    overview           = models.TextField()
    category           = models.CharField(max_length=20, choices=TourCategory.choices, default=TourCategory.ADVENTURE)
    destinations       = models.ManyToManyField(Destination, related_name="packages", blank=True)
    price_usd          = models.DecimalField(max_digits=10, decimal_places=2)
    price_discount_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duration_days      = models.PositiveSmallIntegerField()
    duration_nights    = models.PositiveSmallIntegerField()
    max_group_size     = models.PositiveSmallIntegerField(default=12)
    min_group_size     = models.PositiveSmallIntegerField(default=1)
    difficulty         = models.CharField(max_length=10, choices=DifficultyLevel.choices, default=DifficultyLevel.MODERATE)
    languages          = models.CharField(max_length=200, default="English")
    transportation     = models.TextField(blank=True)
    accommodation      = models.TextField(blank=True)
    meals              = models.CharField(max_length=200, blank=True)
    inclusions         = models.TextField(blank=True)
    exclusions         = models.TextField(blank=True)
    cover_image        = models.ImageField(upload_to="packages/covers/", blank=True, null=True)
    video_url          = models.URLField(blank=True)
    featured           = models.BooleanField(default=False)
    is_active          = models.BooleanField(default=True)
    is_private         = models.BooleanField(default=False)
    meta_title         = models.CharField(max_length=100, blank=True)
    meta_description   = models.CharField(max_length=225, blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-featured", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def effective_price(self):
        return self.price_discount_usd or self.price_usd

    @property
    def is_on_sale(self):
        return self.price_discount_usd is not None and self.price_discount_usd < self.price_usd


class ItineraryDay(models.Model):
    package       = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="itinerary")
    day_number    = models.PositiveSmallIntegerField()
    title         = models.CharField(max_length=255)
    description   = models.TextField()
    meals         = models.CharField(max_length=100, blank=True)
    accommodation = models.CharField(max_length=200, blank=True)
    distance_km   = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)

    TRANSLATABLE_FIELDS = ["title", "description", "meals", "accommodation"]

    class Meta:
        ordering = ["day_number"]
        unique_together = ["package", "day_number"]

    def save(self, *args, **kwargs):
        # Automatically fill empty Amharic (_am) and French (_fr) fields from English (_en)
        translate_missing_fields(self, self.TRANSLATABLE_FIELDS)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Day {self.day_number}: {self.title}"

class PackageImage(models.Model):
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="images")
    image   = models.ImageField(upload_to="packages/gallery/")
    caption = models.CharField(max_length=255, blank=True)
    order   = models.PositiveSmallIntegerField(default=0)

    TRANSLATABLE_FIELDS = ["caption"]

    class Meta:
        ordering = ["order"]

    def save(self, *args, **kwargs):
        translate_missing_fields(self, self.TRANSLATABLE_FIELDS)
        super().save(*args, **kwargs)


class Availability(models.Model):
    package        = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="availability")
    start_date     = models.DateField()
    end_date       = models.DateField()
    total_seats    = models.PositiveSmallIntegerField()
    booked_seats   = models.PositiveSmallIntegerField(default=0)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active      = models.BooleanField(default=True)

    class Meta:
        ordering = ["start_date"]

    @property
    def available_seats(self):
        return self.total_seats - self.booked_seats

    @property
    def is_available(self):
        return self.is_active and self.available_seats > 0