from django.db import models
from django.utils.text import slugify

class Region(models.Model):
    class RegionType(models.TextChoices):
        NORTHERN  = "northern",  "Northern Ethiopia"
        SOUTHERN  = "southern",  "Southern Ethiopia"
        EASTERN   = "eastern",   "Eastern Ethiopia"
        WESTERN   = "western",   "Western Ethiopia"
        CITY      = "city",      "City Tours"
        ADVENTURE = "adventure", "Adventure"
        WILDLIFE  = "wildlife",  "Wildlife"

    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=120, unique=True, blank=True)
    region_type = models.CharField(max_length=20, choices=RegionType.choices)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="regions/", blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug: self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self): return self.name


class Destination(models.Model):
    region      = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="destinations")
    name        = models.CharField(max_length=200)
    slug        = models.SlugField(max_length=220, unique=True, blank=True)
    tagline     = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    history     = models.TextField(blank=True)
    culture     = models.TextField(blank=True)
    travel_tips = models.TextField(blank=True)
    best_time   = models.CharField(max_length=200, blank=True)
    weather_info = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="destinations/covers/", blank=True, null=True)
    featured    = models.BooleanField(default=False)
    latitude    = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude   = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    #altitude_m  = models.PositiveIntegerField(null=True, blank=True)
    altitude_m  = models.CharField(max_length=100, blank=True, null=True)
    meta_title       = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug: self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self): return f"{self.name} ({self.region.name})"


class DestinationImage(models.Model):
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="images")
    image       = models.ImageField(upload_to="destinations/gallery/")
    caption     = models.CharField(max_length=255, blank=True)
    is_cover    = models.BooleanField(default=False)
    order       = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["order"]


class NearbyAttraction(models.Model):
    destination  = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="nearby_attractions")
    name         = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    distance_km  = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
