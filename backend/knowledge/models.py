from django.db import models


class Knowledge(models.Model):
    title = models.CharField(max_length=200, verbose_name="知识点标题")
    description = models.TextField(verbose_name="知识点描述")
    content = models.TextField(verbose_name="知识点内容")
    category = models.CharField(max_length=100, verbose_name="分类")
    views = models.PositiveIntegerField(default=0, verbose_name="浏览次数")
    duration = models.CharField(max_length=20, verbose_name="时长")
    is_ai_generated = models.BooleanField(default=False, verbose_name="AI生成")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        verbose_name = "知识点"
        verbose_name_plural = "知识点"
        ordering = ['-created_at']

    def __str__(self):
        return self.title
