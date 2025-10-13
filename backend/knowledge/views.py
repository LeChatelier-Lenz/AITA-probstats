from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Knowledge
from .serializers import KnowledgeSerializer


class KnowledgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Knowledge.objects.all()
    serializer_class = KnowledgeSerializer

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """获取热门知识点"""
        popular_knowledge = Knowledge.objects.order_by('-views')[:10]
        serializer = self.get_serializer(popular_knowledge, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def category(self, request, category=None):
        """根据分类获取知识点"""
        knowledge = Knowledge.objects.filter(category=category)
        serializer = self.get_serializer(knowledge, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def search(self, request):
        """搜索知识点"""
        query = request.data.get('query', '')
        knowledge = Knowledge.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query) | 
            Q(content__icontains=query)
        )
        serializer = self.get_serializer(knowledge, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """AI生成知识点"""
        question = request.data.get('question', '')
        # 这里可以集成AI生成逻辑
        # 目前返回一个模拟的AI生成内容
        ai_content = f"这是关于'{question}'的AI生成知识点内容..."
        
        ai_knowledge = Knowledge.objects.create(
            title=f"AI生成: {question}",
            description=f"基于问题'{question}'AI生成的知识点",
            content=ai_content,
            category="AI生成",
            duration="5:00",
            is_ai_generated=True
        )
        serializer = self.get_serializer(ai_knowledge)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """更新知识点浏览量"""
        knowledge = self.get_object()
        knowledge.views += 1
        knowledge.save()
        return Response({'views': knowledge.views})
