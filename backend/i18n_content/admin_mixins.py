"""
i18n_content/admin_mixins.py
==============================
Add this mixin to any existing ModelAdmin for a model registered with
django-modeltranslation, to get a right-click "Auto-translate to Amharic &
French" action in the admin's bulk-action dropdown — without rewriting your
existing ModelAdmin classes.

USAGE — in your existing packages/admin.py, destinations/admin.py, blog/admin.py:

    from i18n_content.admin_mixins import TranslationAdminMixin

    @admin.register(TourPackage)
    class TourPackageAdmin(TranslationAdminMixin, admin.ModelAdmin):   # add the mixin here
        list_display = [...]          # ...keep everything else exactly as it was...
        TRANSLATABLE_FIELDS = ["title", "tagline", "overview", "transportation",
                                "accommodation", "meals", "inclusions", "exclusions"]

That's it — the mixin reads TRANSLATABLE_FIELDS off your admin class and
adds the action automatically. Set HTML_FIELDS = {"content"} too if any of
those fields contain rich HTML (e.g. blog Post.content) so the translator
preserves markup instead of mangling it.
"""
from django.contrib import messages
from .translate_service import translate_missing_fields


class TranslationAdminMixin:
    """
    TRANSLATABLE_FIELDS: list of base field names (without _en/_am/_fr
    suffix) that django-modeltranslation has split into per-language
    columns on this model.
    HTML_FIELDS: subset of TRANSLATABLE_FIELDS that contain rich HTML
    (e.g. a blog post body) rather than plain text.
    """
    TRANSLATABLE_FIELDS = []
    HTML_FIELDS = set()

    def get_actions(self, request):
        actions = super().get_actions(request)
        if self.TRANSLATABLE_FIELDS:
            actions["auto_translate_missing"] = (
                TranslationAdminMixin.auto_translate_missing,
                "auto_translate_missing",
                "🌐 Auto-translate to Amharic & French (fills empty fields only)",
            )
        return actions

    def auto_translate_missing(self, request, queryset):
        total_fields = 0
        total_objects = 0
        for instance in queryset:
            filled = translate_missing_fields(
                instance,
                field_names=self.TRANSLATABLE_FIELDS,
                html_fields=self.HTML_FIELDS,
            )
            if filled:
                total_objects += 1
                total_fields += filled

        if total_fields:
            self.message_user(
                request,
                f"Auto-translated {total_fields} field(s) across {total_objects} object(s). "
                f"Review the Amharic/French tabs before publishing — machine translation is a draft, not final copy.",
                level=messages.SUCCESS,
            )
        else:
            self.message_user(
                request,
                "Nothing to translate — either every field already has Amharic/French content, "
                "or GOOGLE_TRANSLATE_API_KEY isn't configured (check server logs for details).",
                level=messages.WARNING,
            )