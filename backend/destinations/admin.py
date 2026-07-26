# ==========================================
# destinations/admin.py
# ==========================================
from django.contrib import admin
from i18n_content.admin_mixins import TranslationAdminMixin
from i18n_content.translate_service import translate_missing_fields
from modeltranslation.admin import TranslationTabularInline
from .models import Region, Destination, DestinationImage, NearbyAttraction


class DestinationImageInline(admin.TabularInline):
    model = DestinationImage
    extra = 1


class NearbyAttractionInline(TranslationTabularInline):
    model = NearbyAttraction
    extra = 1


@admin.register(Region)
class RegionAdmin(TranslationAdminMixin, admin.ModelAdmin):
    TRANSLATABLE_FIELDS = ["name", "description"]
    list_display = ["name", "region_type", "is_active"]
    prepopulated_fields = {"slug": ("name",)}

    def save_model(self, request, obj, form, change):
        # 1. Translate missing fields in-memory before writing to DB
        translate_missing_fields(obj, self.TRANSLATABLE_FIELDS)
        # 2. Save once with all language variants populated
        super().save_model(request, obj, form, change)


@admin.register(Destination)
class DestinationAdmin(TranslationAdminMixin, admin.ModelAdmin):
    TRANSLATABLE_FIELDS = [
        "name", "tagline", "description", "history", 
        "culture", "travel_tips", "weather_info"
    ]
    list_display = ["name", "region", "featured", "is_active", "created_at"]
    list_filter = ["region", "featured", "is_active"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [DestinationImageInline, NearbyAttractionInline]

    def save_model(self, request, obj, form, change):
        # Translate missing values in-memory BEFORE super().save_model writes to DB
        translate_missing_fields(obj, self.TRANSLATABLE_FIELDS)
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        # Process inline items safely without invalid attributes
        instances = formset.save(commit=False)

        # Handle deletions first
        for obj in formset.deleted_objects:
            obj.delete()

        # Define default translatable fields mapping for inline models
        model_trans_map = {
            NearbyAttraction: ["name", "description"],
        }

        # Check if this inline model requires translation
        fields_to_trans = getattr(
            formset.model, 
            "TRANSLATABLE_FIELDS", 
            model_trans_map.get(formset.model, None)
        )

        for obj in instances:
            if fields_to_trans:
                translate_missing_fields(obj, fields_to_trans)
            obj.save()

        formset.save_m2m()