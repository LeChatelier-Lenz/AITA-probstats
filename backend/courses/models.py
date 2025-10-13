from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=200, verbose_name="课程标题")
    description = models.TextField(verbose_name="课程描述")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")

    class Meta:
        verbose_name = "课程"
        verbose_name_plural = "课程"
        ordering = ['created_at']

    def __str__(self):
        return self.title


class Chapter(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('ppt', 'PPT'),
        ('preview', '预习材料'),
        ('video', '视频'),
        ('document', '文档'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters', verbose_name="所属课程")
    title = models.CharField(max_length=200, verbose_name="章节标题")
    description = models.TextField(blank=True, verbose_name="章节描述")
    order = models.PositiveIntegerField(default=0, verbose_name="排序")

    class Meta:
        verbose_name = "章节"
        verbose_name_plural = "章节"
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class ChapterContent(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('ppt', 'PPT'),
        ('preview', '预习材料'),
        ('video', '视频'),
        ('document', '文档'),
    ]

    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='contents', verbose_name="所属章节")
    title = models.CharField(max_length=200, verbose_name="内容标题")
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, verbose_name="内容类型")
    url = models.URLField(verbose_name="内容链接")
    order = models.PositiveIntegerField(default=0, verbose_name="排序")

    class Meta:
        verbose_name = "章节内容"
        verbose_name_plural = "章节内容"
        ordering = ['order']

    def __str__(self):
        return f"{self.chapter.title} - {self.title}"
