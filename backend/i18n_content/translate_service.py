# ==========================================
# 1. i18n_content/translate_service.py
# ==========================================
"""
i18n_content/translate_service.py
===================================
Free translation service using deep-translator (Google Translate web wrapper).
No Google Cloud API key or billing required.
"""
from deep_translator import GoogleTranslator


def translate_text(text: str, target_lang: str, is_html: bool = False) -> str:
    if not text or not text.strip():
        return text
    
    try:
        translator = GoogleTranslator(source='en', target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation error ({target_lang}): {e}")
        return ""


def translate_missing_fields(instance, field_names, html_fields=None):
    """
    Checks all language variants (Amharic 'am', French 'fr') for the given fields.
    If a translation field is empty, it auto-translates the English source value 
    using the free translation utility and saves it.
    """
    if html_fields is None:
        html_fields = set()

    updated_count = 0
    target_langs = ["am", "fr"]

    for field in field_names:
        source_text = getattr(instance, f"{field}_en", None) or getattr(instance, field, "")
        if not source_text:
            continue

        is_html = field in html_fields

        for lang in target_langs:
            lang_field = f"{field}_{lang}"
            current_val = getattr(instance, lang_field, None)

            if not current_val or not current_val.strip():
                translated = translate_text(source_text, target_lang=lang, is_html=is_html)
                if translated:
                    setattr(instance, lang_field, translated)
                    updated_count += 1

    if updated_count > 0:
        instance.save()

    return updated_count

