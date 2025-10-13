from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, Chapter
from .serializers import CourseSerializer, ChapterSerializer


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """获取课程的章节列表"""
        course = self.get_object()
        chapters = course.chapters.all()
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)


class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        """获取章节的详细内容"""
        chapter = self.get_object()
        return Response(ChapterSerializer(chapter).data)
