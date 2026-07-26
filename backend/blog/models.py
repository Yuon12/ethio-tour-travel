# ==========================================
# blog/models.py
# ==========================================
from django.db import models
from django.utils.text import slugify
from django.conf import settings

class Category(models.Model):
    # Removed unique=True here:
    name = models.CharField(max_length=100) 
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="blog/categories/", blank=True, null=True)

    class Meta: 
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug: 
            # Safely fallback to name_en so non-Latin languages don't break the slug
            base_name = getattr(self, 'name_en', self.name) or self.name
            self.slug = slugify(base_name)
        super().save(*args, **kwargs)

    def __str__(self): 
        return self.name


class Tag(models.Model):
    # Removed unique=True here:
    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug: 
            base_name = getattr(self, 'name_en', self.name) or self.name
            self.slug = slugify(base_name)
        super().save(*args, **kwargs)

    def __str__(self): 
        return self.name


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT     = "draft",     "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED  = "archived",  "Archived"

    title       = models.CharField(max_length=255)
    slug        = models.SlugField(max_length=280, unique=True, blank=True)
    author      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="posts")
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="posts")
    tags        = models.ManyToManyField(Tag, blank=True, related_name="posts")
    excerpt     = models.TextField(max_length=500)
    content     = models.TextField()
    cover_image = models.ImageField(upload_to="blog/posts/", blank=True, null=True)
    read_time   = models.PositiveSmallIntegerField(default=5)
    meta_title  = models.CharField(max_length=150, blank=True)
    meta_description = models.CharField(max_length=225, blank=True)
    status      = models.CharField(max_length=15, choices=Status.choices, default=Status.DRAFT)
    published_at= models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)
    view_count  = models.PositiveIntegerField(default=0)
    
    class Meta: 
        ordering = ["-published_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug: 
            base_title = getattr(self, 'title_en', self.title) or self.title
            self.slug = slugify(base_title)
        super().save(*args, **kwargs)

    def __str__(self): 
        return self.title


class Comment(models.Model):
    post        = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="comments")
    guest_name  = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    body        = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    
    class Meta: 
        ordering = ["created_at"]