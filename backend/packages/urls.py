from django.urls import path
from .views import TourPackageListView, FeaturedPackagesView, TourPackageDetailView, PackageAvailabilityView

urlpatterns = [
    path("",                          TourPackageListView.as_view(),    name="package-list"),
    path("featured/",                 FeaturedPackagesView.as_view(),   name="package-featured"),
    path("<slug:slug>/",              TourPackageDetailView.as_view(),  name="package-detail"),
    path("<slug:slug>/availability/", PackageAvailabilityView.as_view(),name="package-availability"),
]
