from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Exercise
from .serializers import ExerciseSerializer, ExerciseCheckSerializer


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    # 支持 /exercise/category/ 和 /exercise/category/<category>/
    @action(detail=False, methods=['get'], url_path=r'category(?:/(?P<category>[^/.]+))?')
    def category(self, request, category=None):
        """根据分类获取练习题"""
        # 如果没有路径参数，则尝试从查询参数获取
        if category is None:
            category = request.query_params.get('category')
        
        if category is None:
            return Response({"detail": "category 参数缺失"}, status=status.HTTP_400_BAD_REQUEST)
        
        exercises = Exercise.objects.filter(category=category)
        serializer = self.get_serializer(exercises, many=True)
        return Response(serializer.data)

    # 支持 /exercise/difficulty/ 和 /exercise/difficulty/<difficulty>/
    @action(detail=False, methods=['get'], url_path=r'difficulty(?:/(?P<difficulty>[^/.]+))?')
    def difficulty(self, request, difficulty=None):
        """根据难度获取练习题"""
        if difficulty is None:
            difficulty = request.query_params.get('difficulty')
        
        if difficulty is None:
            return Response({"detail": "difficulty 参数缺失"}, status=status.HTTP_400_BAD_REQUEST)
        
        exercises = Exercise.objects.filter(difficulty=difficulty)
        serializer = self.get_serializer(exercises, many=True)
        return Response(serializer.data)

    # 检查答案，detail=True 需要 pk
    @action(detail=True, methods=['post'])
    def check(self, request, pk=None):
        """检查练习答案"""
        exercise = self.get_object()
        serializer = ExerciseCheckSerializer(data=request.data)
        
        if serializer.is_valid():
            user_answer = serializer.validated_data['answer']
            correct_answer = exercise.answer
            
            is_correct = user_answer.lower().strip() == correct_answer.lower().strip()
            
            response_data = {
                'is_correct': is_correct,
                'correct_answer': correct_answer,
                'explanation': exercise.explanation,
                'user_answer': user_answer
            }
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
