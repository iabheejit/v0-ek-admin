from django.db import models
from users.models import User
from content.models import Module

class UserActivity(models.Model):
    """Model representing user activity"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(
        max_length=50,
        choices=[
            ('module_start', 'Started Module'),
            ('module_complete', 'Completed Module'),
            ('day_complete', 'Completed Day'),
            ('question_answer', 'Answered Question'),
            ('course_complete', 'Completed Course'),
        ]
    )
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True)
    day_number = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.name} - {self.activity_type} at {self.timestamp}"

class QuestionResponse(models.Model):
    """Model representing a user's response to a question"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='question_responses')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='user_responses')
    question = models.TextField()
    user_answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.name} - {self.question[:30]}... - {self.user_answer[:30]}..."

```python file="analytics/serializers.py"
from rest_framework import serializers
from .models import UserActivity, QuestionResponse

class UserActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    activity_details = serializers.SerializerMethodField()
    
    class Meta:
        model = UserActivity
        fields = ['id', 'user_name', 'activity_type', 'day_number', 'timestamp', 'activity_details']
    
    def get_activity_details(self, obj):
        if obj.module:
            return f"{obj.module.title}"
        elif obj.day_number:
            return f"Day {obj.day_number}"
        return ""

class QuestionResponseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    day_number = serializers.IntegerField(source='module.day.day_number', read_only=True)
    module_number = serializers.IntegerField(source='module.module_number', read_only=True)
    
    class Meta:
        model = QuestionResponse
        fields = [
            'id', 'user_name', 'question', 'user_answer', 'is_correct',
            'timestamp', 'module_title', 'day_number', 'module_number'
        ]
