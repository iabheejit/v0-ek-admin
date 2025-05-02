from django.urls import path
from . import views

urlpatterns = [
    path('api/dashboard/recent-activities/', views.recent_activities, name='recent-activities'),
]
