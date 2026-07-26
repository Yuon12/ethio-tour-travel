from django.urls import path
from .views import CategoryListView, TagListView, PostListView, PostDetailView, CommentCreateView

urlpatterns = [
    path("",                     PostListView.as_view(),    name="post-list"),
    path("categories/",          CategoryListView.as_view(),name="category-list"),
    path("tags/",                TagListView.as_view(),     name="tag-list"),
    path("<slug:slug>/",         PostDetailView.as_view(),  name="post-detail"),
    path("<slug:slug>/comment/", CommentCreateView.as_view(),name="post-comment"),
]
