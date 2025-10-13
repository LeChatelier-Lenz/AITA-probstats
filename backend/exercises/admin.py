from django.contrib import admin
from .models import Exercise


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['category', 'difficulty', 'chapter', 'created_at']
    list_filter = ['category', 'difficulty', 'chapter', 'created_at']
    search_fields = ['question', 'answer', 'explanation']
    ordering = ['-created_at']
