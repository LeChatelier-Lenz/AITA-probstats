from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from exercises.serializers import ExerciseSerializer
from .models import LabeledExercise, ArchivedExercise


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('用户名已存在')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserExerciseListsSerializer(serializers.Serializer):
    labeled = serializers.ListField()
    archived = serializers.ListField()


class LabeledExerciseWithTimeSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()

    class Meta:
        model = LabeledExercise
        fields = ['exercise', 'created_at', 'user_answer', 'correct_answer', 'explanation', 'analysis_saved_at']


class LabeledExerciseAnalysisSerializer(serializers.Serializer):
    user_answer = serializers.CharField(required=False, allow_blank=True)
    correct_answer = serializers.CharField(required=False, allow_blank=True)
    explanation = serializers.CharField(required=False, allow_blank=True)


class ArchivedExerciseWithTimeSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()

    class Meta:
        model = ArchivedExercise
        fields = ['exercise', 'created_at']
