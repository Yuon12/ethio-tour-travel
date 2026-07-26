from django.urls import path
from .views import AlbumListView, AlbumDetailView, FeaturedMediaView

urlpatterns = [
    path("",             AlbumListView.as_view(),   name="album-list"),
    path("featured/",    FeaturedMediaView.as_view(),name="gallery-featured"),
    path("<slug:slug>/", AlbumDetailView.as_view(),  name="album-detail"),
]
