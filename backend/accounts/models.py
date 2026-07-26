"""Custom User model + PasswordResetToken"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email required.")
        user = self.model(email=self.normalize_email(email), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("role", "admin")
        return self.create_user(email, password, **extra)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        TOURIST = "tourist", "Tourist"
        GUIDE   = "guide",   "Tour Guide"
        ADMIN   = "admin",   "Admin"

    email      = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name  = models.CharField(max_length=100)
    phone      = models.CharField(max_length=20, blank=True)
    avatar     = models.ImageField(upload_to="avatars/", blank=True, null=True)
    role       = models.CharField(max_length=10, choices=Role.choices, default=Role.TOURIST)
    nationality    = models.CharField(max_length=100, blank=True)
    bio            = models.TextField(blank=True)
    date_of_birth  = models.DateField(null=True, blank=True)
    is_active          = models.BooleanField(default=True)
    is_staff           = models.BooleanField(default=False)
    is_email_verified  = models.BooleanField(default=False)
    date_joined        = models.DateTimeField(default=timezone.now)
    updated_at         = models.DateTimeField(auto_now=True)

    objects = UserManager()
    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class PasswordResetToken(models.Model):
    """
    One-time token emailed to user for password reset.
    Expires after 1 hour. Deleted after use.
    """
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used       = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def is_expired(self):
        from datetime import timedelta
        return timezone.now() > self.created_at + timedelta(hours=1)

    def __str__(self):
        return f"Reset token for {self.user.email}"



class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __str__(self):
        return self.email