from django.urls import path
from .views import RegisterView, LoginView, ProfileView, ToggleLabelExerciseView, ToggleArchiveExerciseView, MyExercisesView, MyErrorReportView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', ProfileView.as_view(), name='me'),
    path('me/exercises/', MyExercisesView.as_view(), name='my-exercises'),
    path('me/error-report/', MyErrorReportView.as_view(), name='my-error-report'),
    path('exercises/<int:pk>/toggle-label/', ToggleLabelExerciseView.as_view(), name='toggle-label'),
    path('exercises/<int:pk>/toggle-archive/', ToggleArchiveExerciseView.as_view(), name='toggle-archive'),
]
