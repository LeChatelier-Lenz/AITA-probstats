from django.db import models
from courses.models import Chapter


class Exercise(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', '简单'),
        ('medium', '中等'),
        ('hard', '困难'),
    ]

    question = models.TextField(verbose_name="题目")
    options = models.JSONField(default=list, blank=True, verbose_name="选项")
    answer = models.TextField(verbose_name="答案")
    explanation = models.TextField(verbose_name="解释")
    hint = models.TextField(blank=True, verbose_name="提示")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium', verbose_name="难度")
    category = models.CharField(max_length=100, verbose_name="分类")
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="所属章节")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        verbose_name = "练习题"
        verbose_name_plural = "练习题"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category} - {self.question[:50]}..."
