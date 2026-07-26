from django.db import models
from django.utils.text import slugify

class Album(models.Model):
    name        = models.CharField(max_length=200)
    slug        = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="gallery/albums/", blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    order       = models.PositiveSmallIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["order","name"]
    def save(self, *args, **kwargs):
        if not self.slug: self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    def __str__(self): return self.name

class Media(models.Model):
    class MediaType(models.TextChoices):
        PHOTO = "photo", "Photo"
        VIDEO = "video", "Video"
        DRONE = "drone", "Drone Footage"

    album       = models.ForeignKey(Album, on_delete=models.CASCADE, related_name="media_items")
    media_type  = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.PHOTO)
    image       = models.ImageField(upload_to="gallery/photos/", blank=True, null=True)
    video_url   = models.URLField(blank=True)
    title       = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    location    = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    order       = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["order","-uploaded_at"]; verbose_name = "Media Item"
