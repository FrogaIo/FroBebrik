from rest_framework import routers
from django.urls import path, include
from .views import LessonViewSet, TaskViewSet, MaterialViewSet, SubmissionViewSet, run_code
from .views import RegisterView

router = routers.DefaultRouter()
router.register(r'lessons', LessonViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'submissions', SubmissionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/run/', run_code, name='run_code'),
    path('api/register/', RegisterView.as_view(), name='register'),
]
