from rest_framework import serializers
from .models import Region, Destination, DestinationImage, NearbyAttraction

class RegionSerializer(serializers.ModelSerializer):
    destination_count = serializers.IntegerField(source="destinations.count", read_only=True)
    class Meta:
        model  = Region
        fields = ["id","name","slug","region_type","description","cover_image","destination_count"]

class DestinationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DestinationImage
        fields = ["id","image","caption","is_cover","order"]

class NearbyAttractionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = NearbyAttraction
        fields = ["id","name","description","distance_km"]

class DestinationListSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)
    class Meta:
        model  = Destination
        fields = ["id","name","slug","tagline","cover_image","region_name","featured","best_time"]

class DestinationDetailSerializer(serializers.ModelSerializer):
    region             = RegionSerializer(read_only=True)
    images             = DestinationImageSerializer(many=True, read_only=True)
    nearby_attractions = NearbyAttractionSerializer(many=True, read_only=True)
    class Meta:
        model  = Destination
        fields = ["id","name","slug","tagline","description","history","culture","travel_tips",
                  "best_time","weather_info","cover_image","featured","latitude","longitude",
                  "altitude_m","region","images","nearby_attractions",
                  "meta_title","meta_description","created_at","updated_at"]
