# ==========================================
# blog/admin.py
# ==========================================
from django.contrib import admin
from i18n_content.admin_mixins import TranslationAdminMixin
from i18n_content.translate_service import translate_missing_fields
from .models import Category, Tag, Post, Comment


@admin.register(Category)
class CategoryAdmin(TranslationAdminMixin, admin.ModelAdmin):
    TRANSLATABLE_FIELDS = ["name", "description"]
    list_display = ["name"]
    prepopulated_fields = {"slug": ("name",)} # Added this

    def save_model(self, request, obj, form, change):
        translate_missing_fields(obj, self.TRANSLATABLE_FIELDS)
        super().save_model(request, obj, form, change)


@admin.register(Tag)
class TagAdmin(TranslationAdminMixin, admin.ModelAdmin):
    TRANSLATABLE_FIELDS = ["name"]
    list_display = ["name"]
    prepopulated_fields = {"slug": ("name",)} # Added this

    def save_model(self, request, obj, form, change):
        translate_missing_fields(obj, self.TRANSLATABLE_FIELDS)
        super().save_model(request, obj, form, change)


@admin.register(Post)
class PostAdmin(TranslationAdminMixin, admin.ModelAdmin):
    TRANSLATABLE_FIELDS = [
        "title",
        "excerpt",
        "content",
        "meta_title",
        "meta_description",
    ]
    HTML_FIELDS = {"content"}  # Preserves rich text/HTML markup during translation
    list_display = [
        "title",
        "author",
        "category",
        "status",
        "view_count",
        "published_at",
    ]
    list_filter = ["status", "category"]
    search_fields = ["title", "content"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["tags"]

    def save_model(self, request, obj, form, change):
        # 1. Auto-fill author if not explicitly selected
        if not obj.author_id:
            obj.author = request.user

        # 2. Auto-translate empty fields in-memory before saving
        translate_missing_fields(
            obj, self.TRANSLATABLE_FIELDS, html_fields=self.HTML_FIELDS
        )

        # 3. Save model once with all languages populated
        super().save_model(request, obj, form, change)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["post", "author", "guest_name", "is_approved", "created_at"]
    list_filter = ["is_approved"]
    actions = ["approve_comments"]

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)

    approve_comments.short_description = "Approve selected comments"