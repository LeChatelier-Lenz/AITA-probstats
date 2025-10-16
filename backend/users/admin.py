from django.contrib import admin
from .models import UserProfile, LabeledExercise, ArchivedExercise


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')


@admin.register(LabeledExercise)
class LabeledExerciseAdmin(admin.ModelAdmin):
    list_display = ('profile', 'exercise', 'created_at')
    list_filter = ('created_at',)


@admin.register(ArchivedExercise)
class ArchivedExerciseAdmin(admin.ModelAdmin):
    list_display = ('profile', 'exercise', 'created_at')
    list_filter = ('created_at',)
