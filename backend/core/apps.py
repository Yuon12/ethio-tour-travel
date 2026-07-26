from django.apps import AppConfig
from django.conf.locale import LANG_INFO


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        LANG_INFO.setdefault(
            "am",
            {
                "bidi": False,
                "code": "am",
                "name": "Amharic",
                "name_local": "አማርኛ",
            },
        )