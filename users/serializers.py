from rest_framework import serializers
from .models import User, Message

class UserSerializer(serializers.ModelSerializer):
    initials = serializers.CharField(read_only=True)
    last_active = serializers.CharField(source='last_active_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'phone', 'email', 'joined_date', 'current_day', 
            'current_module', 'last_active', 'status', 'course', 'initials'
        ]

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(read_only=True)
    timestamp = serializers.CharField(source='timestamp_display', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender']
