from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('users/', views.users_page, name='users'),
    path('users/<int:user_id>/', views.user_detail, name='user-detail'),
    path('content/', views.content_page, name='content'),
    path('analytics/', views.analytics_page, name='analytics'),
]
