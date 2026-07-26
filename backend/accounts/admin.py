from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as Base
from .models import User

@admin.register(User)
class UserAdmin(Base):
    list_display  = ["email","first_name","last_name","role","is_active","date_joined"]
    list_filter   = ["role","is_active","is_staff"]
    search_fields = ["email","first_name","last_name"]
    ordering      = ["-date_joined"]
    fieldsets = (
        (None,          {"fields": ("email","password")}),
        ("Personal",    {"fields": ("first_name","last_name","phone","avatar","nationality","bio")}),
        ("Role",        {"fields": ("role",)}),
        ("Permissions", {"fields": ("is_active","is_staff","is_superuser","groups","user_permissions")}),
        ("Dates",       {"fields": ("date_joined","last_login")}),
    )
    add_fieldsets = ((None,{"classes":("wide",),"fields":("email","first_name","last_name","role","password1","password2")}),)
