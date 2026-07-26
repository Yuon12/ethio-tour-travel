"""
Root URL Configuration
========================
All routes versioned under /api/v1/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from utils.contact_view import ContactFormView

urlpatterns = [
    path("admin/",               admin.site.urls),
    path("api/v1/auth/",         include("accounts.urls")),
    path("api/v1/destinations/", include("destinations.urls")),
    path("api/v1/packages/",     include("packages.urls")),
    path("api/v1/bookings/",     include("bookings.urls")),
    path("api/v1/blog/",         include("blog.urls")),
    path("api/v1/gallery/",      include("gallery.urls")),
    path("api/v1/reviews/",      include("reviews.urls")),
    path("api/v1/contact/",      ContactFormView.as_view(), name="contact-form"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)






