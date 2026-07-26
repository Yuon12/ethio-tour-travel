from django.contrib import admin
from .models import Album, Media

class MediaInline(admin.TabularInline):
    model = Media; extra = 1

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ["name","is_active","order","created_at"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [MediaInline]
