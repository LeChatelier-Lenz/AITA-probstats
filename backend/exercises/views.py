from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .utils import call_deepseek_api
from .models import Exercise
from .serializers import ExerciseSerializer
from .pagination import ExercisePagination




class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    pagination_class = ExercisePagination

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        统一查询接口
        - 接受 query params:
          category: 单个字符串
          difficulty: 可重复传递，表示数组参数
          page: 可选分页参数（整数）
        - 示例: /exercise/search?category=统计学&difficulty=easy&difficulty=medium&page=2
        """
        category = request.query_params.get('category')
        difficulty = request.query_params.getlist('difficulty')  # 支持重复参数 -> 数组
        page = request.query_params.get('page')

        qs = self.queryset

        # 按 category 过滤
        if category:
            qs = qs.filter(category=category)

        # 按 difficulty 过滤
        if difficulty:
            qs = qs.filter(difficulty__in=difficulty)

        # 使用 DRF 分页器统一处理
        page_obj = self.paginate_queryset(qs)
        if page_obj is not None:
            serializer = self.get_serializer(page_obj, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['get'], url_path='check')
    def check_exercise(self, request):
        """
        检查练习答案
        GET 参数:
          - id: 练习题 ID
          - answer: 用户提交答案
        返回格式:
        {
            "is_correct": bool,
            "correct_answer": string,
            "explanation": string,
            "user_answer": string
        }
        """
        exercise_id = request.query_params.get('id')
        user_answer = request.query_params.get('answer')

        if not exercise_id or not user_answer:
            return Response(
                {"detail": "id 和 answer 参数必须提供"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            exercise = Exercise.objects.get(pk=exercise_id)
        except Exercise.DoesNotExist:
            return Response(
                {"detail": "指定的练习不存在"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 这里调用 DeepSeek API 判断是否正确
        is_correct,explanation = call_deepseek_api(exercise.question,user_answer, exercise.answer)

        response_data = {
            "is_correct": is_correct,
            "correct_answer": exercise.answer,
            "explanation": explanation,
            "user_answer": user_answer
        }

        return Response(response_data)