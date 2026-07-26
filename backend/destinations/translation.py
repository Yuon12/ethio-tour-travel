# ==========================================
# destinations/translation.py
# ==========================================
from modeltranslation.translator import TranslationOptions, register
from .models import Destination, NearbyAttraction, Region


@register(Region)
class RegionTranslationOptions(TranslationOptions):
    fields = (
        "name",
        "description",
    )


@register(Destination)
class DestinationTranslationOptions(TranslationOptions):
    fields = (
        "name",
        "tagline",
        "description",
        "history",
        "culture",
        "travel_tips",
        "best_time",       # Translatable
        "weather_info",
        "altitude_m",      # Translatable now that it's CharField
        "meta_title",
        "meta_description",
    )


@register(NearbyAttraction)
class NearbyAttractionTranslationOptions(TranslationOptions):
    fields = (
        "name",
        "description",
    )