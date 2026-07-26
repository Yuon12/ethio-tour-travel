from modeltranslation.translator import register, TranslationOptions
from .models import TourPackage, ItineraryDay, PackageImage

@register(TourPackage)
class TourPackageTranslationOptions(TranslationOptions):
    fields = (
        "title", "tagline", "overview", "transportation",
        "accommodation", "meals", "inclusions", "exclusions",
        "meta_title", "meta_description",
    )

@register(ItineraryDay)
class ItineraryDayTranslationOptions(TranslationOptions):
    fields = ("title", "description", "meals", "accommodation")

@register(PackageImage)
class PackageImageTranslationOptions(TranslationOptions):
    fields = ("caption",)