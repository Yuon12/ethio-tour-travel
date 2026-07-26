from rest_framework import serializers
from .models import Album, Media

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Media
        fields = ["id","media_type","image","video_url","title","description","location","is_featured","order"]

class AlbumListSerializer(serializers.ModelSerializer):
    media_count = serializers.IntegerField(source="media_items.count", read_only=True)
    class Meta:
        model  = Album
        fields = ["id","name","slug","description","cover_image","media_count"]

class AlbumDetailSerializer(serializers.ModelSerializer):
    media_items = MediaSerializer(many=True, read_only=True)
    class Meta:
        model  = Album
        fields = ["id","name","slug","description","cover_image","media_items"]
