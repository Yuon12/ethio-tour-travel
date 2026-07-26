from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Tag, Post, Comment
from .serializers import CategorySerializer, TagSerializer, PostListSerializer, PostDetailSerializer, CommentCreateSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all(); serializer_class = CategorySerializer; permission_classes = [AllowAny]

class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all(); serializer_class = TagSerializer; permission_classes = [AllowAny]

class PostListView(generics.ListAPIView):
    serializer_class   = PostListSerializer; permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ["category__slug","tags__slug"]
    search_fields      = ["title","excerpt","content"]
    ordering_fields    = ["published_at","view_count"]
    def get_queryset(self):
        return Post.objects.filter(status=Post.Status.PUBLISHED).select_related("author","category").prefetch_related("tags")

class PostDetailView(generics.RetrieveAPIView):
    serializer_class   = PostDetailSerializer; permission_classes = [AllowAny]; lookup_field = "slug"
    def get_queryset(self):
        return Post.objects.filter(status=Post.Status.PUBLISHED).select_related("author","category").prefetch_related("tags","comments")
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Post.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        return Response(self.get_serializer(instance).data)

class CommentCreateView(generics.CreateAPIView):
    serializer_class   = CommentCreateSerializer; permission_classes = [AllowAny]
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(author=user, is_approved=False)
