from django.contrib.auth import authenticate
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from exercises.models import Exercise
from exercises.serializers import ExerciseSerializer
from .models import LabeledExercise, ArchivedExercise, UserErrorReport
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ProfileSerializer,
    LabeledExerciseWithTimeSerializer,
    ArchivedExerciseWithTimeSerializer,
    LabeledExerciseAnalysisSerializer,
)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': ProfileSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # 直接从请求中读取字段（已通过校验）
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'detail': '用户名或密码错误'}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': ProfileSerializer(user).data})


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'user': ProfileSerializer(request.user).data})


class ToggleLabelExerciseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response({'detail': '习题不存在'}, status=status.HTTP_404_NOT_FOUND)
        profile = request.user.profile
        entry = LabeledExercise.objects.filter(profile=profile, exercise=exercise).first()
        if entry:
            entry.delete()
            action = 'unlabeled'
        else:
            # 若带有错因分析，则同时保存
            analysis_data = request.data if request.method == 'POST' else {}
            data_ser = LabeledExerciseAnalysisSerializer(data=analysis_data)
            ua = ca = ex = None
            if data_ser.is_valid():
                vd = getattr(data_ser, 'validated_data', None)
                if isinstance(vd, dict):
                    ua = vd.get('user_answer')
                    ca = vd.get('correct_answer')
                    ex = vd.get('explanation')
            entry = LabeledExercise.objects.create(
                profile=profile,
                exercise=exercise,
                user_answer=ua or None,
                correct_answer=ca or None,
                explanation=ex or None,
                analysis_saved_at=timezone.now() if any([ua, ca, ex]) else None,
            )
            action = 'labeled'
            # 触发一次易错报告更新
            try:
                from exercises.utils import generate_error_report
                qs = LabeledExercise.objects.filter(profile=profile).exclude(explanation__isnull=True).exclude(explanation__exact='').order_by('-created_at')[:20]
                payload = []
                for a in qs.select_related('exercise'):
                    payload.append({
                        'question': getattr(a.exercise, 'question', ''),
                        'user_answer': a.user_answer or '',
                        'correct_answer': a.correct_answer or '',
                        'explanation': a.explanation or '',
                    })
                report_md = generate_error_report(payload)
                if report_md:
                    report, _ = UserErrorReport.objects.get_or_create(profile=profile)
                    report.content = report_md
                    report.save()
            except Exception:
                pass
        return Response({'status': action})


class ToggleArchiveExerciseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response({'detail': '习题不存在'}, status=status.HTTP_404_NOT_FOUND)
        profile = request.user.profile
        entry = ArchivedExercise.objects.filter(profile=profile, exercise=exercise).first()
        if entry:
            entry.delete()
            action = 'unarchived'
        else:
            ArchivedExercise.objects.create(profile=profile, exercise=exercise)
            action = 'archived'
        return Response({'status': action})


class MyExercisesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        labeled_qs = LabeledExercise.objects.filter(profile=profile).select_related('exercise')
        archived_qs = ArchivedExercise.objects.filter(profile=profile).select_related('exercise')
        labeled = LabeledExerciseWithTimeSerializer(labeled_qs, many=True).data
        archived = ArchivedExerciseWithTimeSerializer(archived_qs, many=True).data
        return Response({'labeled': labeled, 'archived': archived})


class MyErrorReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        report, _ = UserErrorReport.objects.get_or_create(profile=profile)
        return Response({'content': report.content, 'updated_at': report.updated_at})
