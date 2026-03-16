from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    ROLE_CHOICES = (("teacher", "Преподаватель"), ("student", "Студент"))
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Lesson(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    description = models.TextField(blank=True, verbose_name='Описание')
    date = models.DateField(verbose_name='Дата')

    def __str__(self):
        return f"{self.title} — {self.date}"


class Material(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='materials')
    file = models.FileField(upload_to='materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


class Task(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200, verbose_name='Задание')
    description = models.TextField(verbose_name='Описание задания')

    def __str__(self):
        return self.title


class Submission(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(null=True, blank=True)
    # execution status and outputs
    STATUS_CHOICES = (("pending", "Ожидает"), ("running", "Выполняется"), ("done", "Готово"), ("error", "Ошибка"))
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='pending')
    stdout = models.TextField(blank=True, null=True)
    stderr = models.TextField(blank=True, null=True)
    attempts = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.task.title} — {self.student.username} @ {self.created_at}"
