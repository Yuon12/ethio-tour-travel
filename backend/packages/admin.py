# ==========================================
# packages/admin.py
# ==========================================
from django.contrib import admin
from i18n_content.admin_mixins import TranslationAdminMixin
from i18n_content.translate_service import translate_missing_fields
from modeltranslation.admin import TranslationTabularInline
from .models import Availability, ItineraryDay, PackageImage, TourPackage


class ItineraryDayInline(TranslationTabularInline):
    model = ItineraryDay
    extra = 1


class PackageImageInline(TranslationTabularInline):
    model = PackageImage
    extra = 1


class AvailabilityInline(admin.TabularInline):
    model = Availability
    extra = 1


@admin.register(TourPackage)
class TourPackageAdmin(TranslationAdminMixin, admin.ModelAdmin):
    TRANSLATABLE_FIELDS = [
        "title",
        "tagline",
        "overview",
        "transportation",
        "accommodation",
        "meals",
        "inclusions",
        "exclusions",
        "meta_title",
        "meta_description",
    ]
    list_display = [
        "title",
        "category",
        "difficulty",
        "price_usd",
        "duration_days",
        "featured",
        "is_active",
    ]
    list_filter = ["category", "difficulty", "featured", "is_active"]
    search_fields = ["title", "overview"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["destinations"]
    inlines = [ItineraryDayInline, PackageImageInline, AvailabilityInline]

    def save_model(self, request, obj, form, change):
        translate_missing_fields(obj, self.TRANSLATABLE_FIELDS)
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)

        for obj in formset.deleted_objects:
            obj.delete()

        model_trans_map = {
            ItineraryDay: ["title", "description", "meals", "accommodation"],
            PackageImage: ["caption"],
        }

        fields_to_trans = model_trans_map.get(formset.model)

        for obj in instances:
            if fields_to_trans:
                # Clear out empty strings so translate_missing_fields knows they are empty
                for field in fields_to_trans:
                    for lang in ["am", "fr"]:
                        attr = f"{field}_{lang}"
                        if hasattr(obj, attr) and not getattr(obj, attr):
                            setattr(obj, attr, None)

                translate_missing_fields(obj, fields_to_trans)
            obj.save()

        formset.save_m2m()