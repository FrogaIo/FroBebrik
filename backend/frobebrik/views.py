import subprocess
import tempfile
import sys
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import Lesson, Material, Task, Submission
from .serializers import LessonSerializer, MaterialSerializer, TaskSerializer, SubmissionSerializer
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers as drf_serializers


class RegisterSerializer(drf_serializers.Serializer):
    username = drf_serializers.CharField()
    password = drf_serializers.CharField(write_only=True)
    role = drf_serializers.ChoiceField(choices=[('teacher','Преподаватель'),('student','Студент')], default='student')


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = User.objects.create_user(username=data['username'], password=data['password'])
        # create profile
        from .models import Profile
        Profile.objects.create(user=user, role=data.get('role','student'))
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().order_by('date')
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Ensure lesson is provided via serializer (lesson_id) — serializer will validate
        serializer.save()


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all().order_by('-created_at')
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # student must be the authenticated user
        user = self.request.user
        serializer.save(student=user, status='pending')

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        submission = get_object_or_404(Submission, pk=pk)
        score = int(request.data.get('score', 0))
        if score not in (0, 100):
            return Response({'detail': 'Оценка должна быть 0 или 100'}, status=400)
        submission.score = score
        submission.save()
        return Response({'status': 'graded', 'score': submission.score})


@api_view(['POST'])
@permission_classes([AllowAny])
def run_code(request):
    """Run python code in a sandbox. Prefer Docker-based execution with resource limits and disabled network.
    Fallback to temporary-file execution if docker is not available. NOT PRODUCTION-READY.
    """
    code = request.data.get('code', '')
    if code is None or code == '':
        return Response({'error': 'No code provided'}, status=400)

    # Try Docker runner first
    import shutil
    docker_path = shutil.which('docker')
    if docker_path:
        try:
            # Run code via docker: feed code via stdin to python -
            cmd = [
                docker_path,
                'run', '--rm', '-i',
                '--network', 'none',
                '--pids-limit', '64',
                '--memory', '128m',
                '--cpus', '0.5',
                'python:3.11-slim',
                'python', '-'
            ]
            completed = subprocess.run(cmd, input=code, capture_output=True, text=True, timeout=5)
            return Response({'stdout': completed.stdout, 'stderr': completed.stderr, 'returncode': completed.returncode})
        except subprocess.TimeoutExpired:
            return Response({'error': 'timeout'}, status=504)
        except Exception as e:
            # fallback to local runner
            pass

    # Fallback: write to temp file and execute locally (legacy)
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        fname = f.name

    try:
        # On Unix, resource limits could be applied; on Windows this is a best-effort fallback
        completed = subprocess.run([sys.executable, fname], capture_output=True, text=True, timeout=5)
        return Response({'stdout': completed.stdout, 'stderr': completed.stderr, 'returncode': completed.returncode})
    except subprocess.TimeoutExpired:
        return Response({'error': 'timeout'}, status=504)
