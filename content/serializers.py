from rest_framework import serializers
from .models import Course, Day, Module, MediaFile

class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = ['id', 'name', 'file', 'file_type', 'created_at']

class ModuleSerializer(serializers.ModelSerializer):
    media_files = MediaFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = [
            'id', 'module_number', 'title', 'text', 'question', 
            'answer_options', 'correct_answer', 'next_action', 'media_files'
        ]

class DaySerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Day
        fields = ['id', 'day_number', 'topic', 'modules']

class CourseSerializer(serializers.ModelSerializer):
    days = DaySerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'days']
        
class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
