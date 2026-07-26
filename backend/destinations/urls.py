from django.urls import path
from .views import RegionListView, DestinationListView, DestinationDetailView, FeaturedDestinationsView

urlpatterns = [
    path("",              DestinationListView.as_view(),    name="destination-list"),
    path("featured/",     FeaturedDestinationsView.as_view(),name="destination-featured"),
    path("regions/",      RegionListView.as_view(),         name="region-list"),
    path("<slug:slug>/",  DestinationDetailView.as_view(),  name="destination-detail"),
]
