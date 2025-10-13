from rest_framework import serializers
from .models import Knowledge


class KnowledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Knowledge
        fields = ['id', 'title', 'description', 'content', 'category', 'views', 'duration', 'is_ai_generated', 'created_at']
