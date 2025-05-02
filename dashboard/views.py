from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from users.models import User, Message
from content.models import Course, Day, Module
from analytics.models import UserActivity, QuestionResponse
from datetime import datetime, timedelta

@login_required
def index(request):
    """Render the dashboard index page"""
    return render(request, 'dashboard/index.html')

@login_required
def users_page(request):
    """Render the users page"""
    return render(request, 'dashboard/users.html')

@login_required
def user_detail(request, user_id):
    """Render the user detail page"""
    user = User.objects.get(id=user_id)
    return render(request, 'dashboard/user_detail.html', {'user': user})

@login_required
def content_page(request):
    """Render the content management page"""
    return render(request, 'dashboard/content.html')

@login_required
def analytics_page(request):
    """Render the analytics page"""
    return render(request, 'dashboard/analytics.html')

@login_required
def recent_activities(request):
    """Get recent user activities for the dashboard"""
    activities = UserActivity.objects.select_related('user', 'module').order_by('-timestamp')[:5]
    
    result = []
    for activity in activities:
        action = ""
        if activity.activity_type == 'module_complete':
            action = f"completed Day {activity.day_number} Module {activity.module.module_number}"
        elif activity.activity_type == 'day_complete':
            action = f"completed Day {activity.day_number}"
        elif activity.activity_type == 'question_answer':
            action = f"answered a question in Day {activity.day_number} Module {activity.module.module_number}"
        elif activity.activity_type == 'course_complete':
            action = "completed the course"
        
        result.append({
            'id': activity.id,
            'user': activity.user.name,
            'action': action,
            'time': activity.timestamp.strftime("%I:%M %p") if datetime.now().date() == activity.timestamp.date() else f"{(datetime.now() - activity.timestamp).days} days ago",
            'avatar': '/placeholder.svg?height=32&width=32',
            'initials': activity.user.initials,
        })
    
    return JsonResponse({'activities': result})
