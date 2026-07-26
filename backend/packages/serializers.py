from rest_framework import serializers
from .models import TourPackage, ItineraryDay, PackageImage, Availability

class ItineraryDaySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ItineraryDay
        fields = ["id","day_number","title","description","meals","accommodation","distance_km"]

class PackageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PackageImage
        fields = ["id","image","caption","order"]

class AvailabilitySerializer(serializers.ModelSerializer):
    available_seats = serializers.ReadOnlyField()
    is_available    = serializers.ReadOnlyField()
    class Meta:
        model  = Availability
        fields = ["id","start_date","end_date","total_seats","booked_seats","available_seats","is_available","price_override"]

class TourPackageListSerializer(serializers.ModelSerializer):
    effective_price   = serializers.ReadOnlyField()
    is_on_sale        = serializers.ReadOnlyField()
    destination_names = serializers.SerializerMethodField()
    class Meta:
        model  = TourPackage
        fields = ["id","title","slug","tagline","cover_image","category","difficulty",
                  "duration_days","duration_nights","price_usd","price_discount_usd",
                  "effective_price","is_on_sale","max_group_size","featured","destination_names"]
    def get_destination_names(self, obj):
        return list(obj.destinations.values_list("name", flat=True))

class TourPackageDetailSerializer(serializers.ModelSerializer):
    itinerary       = ItineraryDaySerializer(many=True, read_only=True)
    images          = PackageImageSerializer(many=True, read_only=True)
    availability    = AvailabilitySerializer(many=True, read_only=True)
    effective_price = serializers.ReadOnlyField()
    is_on_sale      = serializers.ReadOnlyField()
    inclusions_list = serializers.SerializerMethodField()
    exclusions_list = serializers.SerializerMethodField()
    class Meta:
        model  = TourPackage
        fields = ["id","title","slug","tagline","overview","category","difficulty",
                  "duration_days","duration_nights","price_usd","price_discount_usd",
                  "effective_price","is_on_sale","max_group_size","min_group_size",
                  "languages","transportation","accommodation","meals",
                  "inclusions","exclusions","inclusions_list","exclusions_list",
                  "cover_image","video_url","featured","itinerary","images","availability",
                  "meta_title","meta_description","created_at","updated_at"]
    def get_inclusions_list(self, obj):
        return [l.strip() for l in obj.inclusions.splitlines() if l.strip()]
    def get_exclusions_list(self, obj):
        return [l.strip() for l in obj.exclusions.splitlines() if l.strip()]
