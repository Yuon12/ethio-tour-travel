from rest_framework import serializers
from .models import Category, Tag, Post, Comment

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(source="posts.count", read_only=True)
    class Meta:
        model  = Category
        fields = ["id","name","slug","description","cover_image","post_count"]

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Tag
        fields = ["id","name","slug"]

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    class Meta:
        model  = Comment
        fields = ["id","body","author_name","guest_name","created_at"]
    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else obj.guest_name

class PostListSerializer(serializers.ModelSerializer):
    author_name   = serializers.CharField(source="author.get_full_name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    class Meta:
        model  = Post
        fields = ["id","title","slug","excerpt","cover_image","author_name","category_name","category_slug","read_time","view_count","published_at"]

class PostDetailSerializer(serializers.ModelSerializer):
    author_name   = serializers.CharField(source="author.get_full_name", read_only=True)
    author_avatar = serializers.ImageField(source="author.avatar", read_only=True)
    category      = CategorySerializer(read_only=True)
    tags          = TagSerializer(many=True, read_only=True)
    comments      = serializers.SerializerMethodField()
    class Meta:
        model  = Post
        fields = ["id","title","slug","excerpt","content","cover_image","author_name","author_avatar","category","tags","read_time","view_count","meta_title","meta_description","published_at","updated_at","comments"]
    def get_comments(self, obj):
        return CommentSerializer(obj.comments.filter(is_approved=True), many=True).data

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Comment
        fields = ["post","body","guest_name","guest_email"]
