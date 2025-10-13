from django.contrib import admin
from .models import Course, Chapter, ChapterContent


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'description']
    ordering = ['course', 'order']


@admin.register(ChapterContent)
class ChapterContentAdmin(admin.ModelAdmin):
    list_display = ['title', 'chapter', 'content_type', 'order']
    list_filter = ['content_type', 'chapter__course']
    search_fields = ['title']
    ordering = ['chapter', 'order']
