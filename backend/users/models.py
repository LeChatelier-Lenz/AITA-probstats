from django.db import models
from django.contrib.auth.models import User
from exercises.models import Exercise
from courses.models import Course
from knowledge.models import Knowledge


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name='用户')
    # 额外信息
    labeled_exercises = models.ManyToManyField(Exercise, blank=True, related_name='labeled_by', verbose_name='标注习题')
    archived_exercises = models.ManyToManyField(Exercise, blank=True, related_name='archived_by', verbose_name='归档习题')

    # 与其他两个 app 的相关内容（暂未用到，预留字段，可为空）
    favorite_course = models.ForeignKey(Course, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='相关课程(预留)')
    focus_knowledge = models.ForeignKey(Knowledge, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='相关知识点(预留)')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = '用户资料'
        verbose_name_plural = '用户资料'

    def __str__(self):
        return self.user.username


class LabeledExercise(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='labeled_entries', verbose_name='用户')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='label_entries', verbose_name='习题')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='标注时间')
    # 错因分析（可选）
    user_answer = models.TextField(null=True, blank=True, verbose_name='用户答案(错因)')
    correct_answer = models.TextField(null=True, blank=True, verbose_name='正确答案(错因)')
    explanation = models.TextField(null=True, blank=True, verbose_name='错因解释')
    analysis_saved_at = models.DateTimeField(null=True, blank=True, verbose_name='错因保存时间')

    class Meta:
        verbose_name = '标注记录'
        verbose_name_plural = '标注记录'
        unique_together = ('profile', 'exercise')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.profile} - {self.exercise}"


class ArchivedExercise(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='archived_entries', verbose_name='用户')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='archive_entries', verbose_name='习题')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='归档时间')

    class Meta:
        verbose_name = '归档记录'
        verbose_name_plural = '归档记录'
        unique_together = ('profile', 'exercise')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.profile} - {self.exercise}"


class UserErrorReport(models.Model):
    profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='error_report', verbose_name='用户')
    content = models.TextField(blank=True, default='', verbose_name='易错报告（Markdown）')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '用户易错报告'
        verbose_name_plural = '用户易错报告'

    def __str__(self):
        return f"ErrorReport({self.profile})"
