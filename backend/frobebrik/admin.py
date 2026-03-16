from django.contrib import admin
from .models import Profile, Lesson, Material, Task, Submission

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('file', 'lesson', 'uploaded_at')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('task', 'student', 'created_at', 'score')
