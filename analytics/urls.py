from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    dashboard_metrics, completion_rates, engagement_metrics, 
    response_analytics, UserActivityViewSet, QuestionResponseViewSet
)

router = DefaultRouter()
router.register(r'activities', UserActivityViewSet)
router.register(r'responses', QuestionResponseViewSet)

urlpatterns = [
    path('metrics/dashboard/', dashboard_metrics, name='dashboard-metrics'),
    path('metrics/completion/', completion_rates, name='completion-rates'),
    path('metrics/engagement/', engagement_metrics, name='engagement-metrics'),
    path('metrics/responses/', response_analytics, name='response-analytics'),
    path('', include(router.urls)),
]
