from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Lesson, Material, Task, Submission


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = ['user', 'role']


class MaterialSerializer(serializers.ModelSerializer):
    # Accept a lesson id when creating a material and expose the lesson id in responses
    lesson_id = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), write_only=True, source='lesson')
    lesson = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Material
        fields = ['id', 'lesson', 'lesson_id', 'file', 'uploaded_at']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'lesson', 'title', 'description']


class LessonSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'date', 'materials', 'tasks']


class SubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    task_id = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), write_only=True, source='task')

    class Meta:
        model = Submission
        fields = ['id', 'task', 'task_id', 'student', 'code', 'created_at', 'score', 'status', 'stdout', 'stderr', 'attempts']
