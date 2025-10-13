from rest_framework import serializers
from .models import Course, Chapter, ChapterContent


class ChapterContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterContent
        fields = ['id', 'title', 'content_type', 'url', 'order']


class ChapterSerializer(serializers.ModelSerializer):
    contents = ChapterContentSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'title', 'description', 'order', 'contents']


class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'chapters']
