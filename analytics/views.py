from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Case, When, IntegerField, F
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
from .models import UserActivity, QuestionResponse
from .serializers import UserActivitySerializer, QuestionResponseSerializer
from users.models import User
from content.models import Module

@api_view(['GET'])
def dashboard_metrics(request):
    """Get metrics for the dashboard"""
    # Get total users
    total_users = User.objects.count()
    
    # Get new users in the last month
    last_month = datetime.now() - timedelta(days=30)
    new_users = User.objects.filter(joined_date__gte=last_month).count()
    
    # Get active courses
    active_courses = 8  # In a real app, this would be calculated from your database
    
    # Get messages sent today
    today = datetime.now().date()
    messages_sent = 3782  # In a real app, this would be calculated from your database
    
    # Get completion rate
    completion_rate = 78  # In a real app, this would be calculated from your database
    
    return Response({
        'total_users': total_users,
        'new_users_percent': round((new_users / total_users * 100) if total_users > 0 else 0),
        'active_courses': active_courses,
        'messages_sent': messages_sent,
        'completion_rate': completion_rate
    })

@api_view(['GET'])
def completion_rates(request):
    """Get completion rates by day"""
    timeframe = request.query_params.get('timeframe', '30days')
    
    # In a real app, this would be calculated from your database
    # This is mock data for demonstration
    data = [
        {"name": "Day 1", "completed": 92, "inProgress": 5, "notStarted": 3},
        {"name": "Day 2", "completed": 85, "inProgress": 10, "notStarted": 5},
        {"name": "Day 3", "completed": 70, "inProgress": 15, "notStarted": 15},
        {"name": "Day 4", "completed": 55, "inProgress": 20, "notStarted": 25},
        {"name": "Day 5", "completed": 40, "inProgress": 15, "notStarted": 45},
    ]
    
    return Response(data)

@api_view(['GET'])
def engagement_metrics(request):
    """Get engagement metrics"""
    timeframe = request.query_params.get('timeframe', '7days')
    
    # In a real app, this would be calculated from your database
    # This is mock data for demonstration
    data = [
        {"date": "Mon", "activeUsers": 120, "messages": 450},
        {"date": "Tue", "activeUsers": 132, "messages": 489},
        {"date": "Wed", "activeUsers": 145, "messages": 521},
        {"date": "Thu", "activeUsers": 140, "messages": 510},
        {"date": "Fri", "activeUsers": 135, "messages": 498},
        {"date": "Sat", "activeUsers": 110, "messages": 380},
        {"date": "Sun", "activeUsers": 105, "messages": 370},
    ]
    
    return Response(data)

@api_view(['GET'])
def response_analytics(request):
    """Get question response analytics"""
    # Get all question responses
    responses = QuestionResponse.objects.all()
    
    # Calculate overall correct percentage
    total_responses = responses.count()
    correct_responses = responses.filter(is_correct=True).count()
    correct_percentage = (correct_responses / total_responses * 100) if total_responses > 0 else 0
    
    # Get question-specific data
    questions = QuestionResponse.objects.values('question', 'module__title', 'module__day__day_number', 'module__module_number') \
        .annotate(
            total=Count('id'),
            correct=Sum(Case(When(is_correct=True, then=1), default=0, output_field=IntegerField())),
        ) \
        .order_by('module__day__day_number', 'module__module_number')
    
    question_data = []
    for q in questions:
        correct_percent = (q['correct'] / q['total'] * 100) if q['total'] > 0 else 0
        question_data.append({
            'question': q['question'],
            'day': q['module__day__day_number'],
            'module': q['module__module_number'],
            'module_title': q['module__title'],
            'correct_percent': round(correct_percent),
            'total_responses': q['total']
        })
    
    # Prepare chart data
    chart_data = [
        {'name': 'Correct', 'value': round(correct_percentage, 1)},
        {'name': 'Incorrect', 'value': round(100 - correct_percentage, 1)},
    ]
    
    return Response({
        'questions': question_data,
        'chart_data': chart_data
    })

class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for user activities"""
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    
    def get_queryset(self):
        queryset = UserActivity.objects.all()
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by activity type if provided
        activity_type = self.request.query_params.get('activity_type', None)
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset

class QuestionResponseViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for question responses"""
    queryset = QuestionResponse.objects.all()
    serializer_class = QuestionResponseSerializer
    
    def get_queryset(self):
        queryset = QuestionResponse.objects.all()
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by module if provided
        module_id = self.request.query_params.get('module_id', None)
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        
        # Filter by correctness if provided
        is_correct = self.request.query_params.get('is_correct', None)
        if is_correct is not None:
            is_correct = is_correct.lower() == 'true'
            queryset = queryset.filter(is_correct=is_correct)
        
        return queryset
