from django.contrib import admin
from .models import Knowledge


@admin.register(Knowledge)
class KnowledgeAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'views', 'is_ai_generated', 'created_at']
    list_filter = ['category', 'is_ai_generated', 'created_at']
    search_fields = ['title', 'description', 'content']
    ordering = ['-created_at']
