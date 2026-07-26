from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    author_name   = serializers.CharField(source="user.get_full_name", read_only=True)
    author_avatar = serializers.ImageField(source="user.avatar", read_only=True)
    package_title = serializers.CharField(source="tour_package.title", read_only=True)
    class Meta:
        model  = Review
        fields = ["id","tour_package","package_title","author_name","author_avatar","rating","title","content","score_guide","score_accommodation","score_value","score_transport","is_featured","created_at"]
        read_only_fields = ["is_approved","is_featured"]
