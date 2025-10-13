from rest_framework import serializers
from .models import Exercise


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'question', 'options', 'answer', 'explanation', 'hint', 'difficulty', 'category', 'chapter', 'created_at']


class ExerciseCheckSerializer(serializers.Serializer):
    answer = serializers.CharField()
    
    def validate_answer(self, value):
        if not value:
            raise serializers.ValidationError("答案不能为空")
        return value
