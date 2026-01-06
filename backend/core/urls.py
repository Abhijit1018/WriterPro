from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, TaskViewSet, SubmissionViewSet, TransactionViewSet, UserViewSet, MeView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('', include(router.urls)),
]
