from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Course, Day, Module, MediaFile
from .serializers import (
    CourseSerializer, CourseListSerializer, DaySerializer, 
    ModuleSerializer, MediaFileSerializer
)

class CourseViewSet(viewsets.ModelViewSet):
    """API endpoint for courses"""
    queryset = Course.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer
    
    @action(detail=True, methods=['get'])
    def days(self, request, pk=None):
        """Get days for a course"""
        course = self.get_object()
        days = Day.objects.filter(course=course)
        serializer = DaySerializer(days, many=True)
        return Response(serializer.data)

class DayViewSet(viewsets.ModelViewSet):
    """API endpoint for days"""
    queryset = Day.objects.all()
    serializer_class = DaySerializer
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        if course_id:
            return Day.objects.filter(course_id=course_id)
        return Day.objects.all()
    
    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None, course_pk=None):
        """Get modules for a day"""
        day = self.get_object()
        modules = Module.objects.filter(day=day)
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

class ModuleViewSet(viewsets.ModelViewSet):
    """API endpoint for modules"""
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    
    def get_queryset(self):
        day_id = self.kwargs.get('day_pk')
        if day_id:
            return Module.objects.filter(day_id=day_id)
        return Module.objects.all()

class MediaFileViewSet(viewsets.ModelViewSet):
    """API endpoint for media files"""
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        module_id = self.kwargs.get('module_pk')
        if module_id:
            return MediaFile.objects.filter(module_id=module_id)
        return MediaFile.objects.all()
    
    def create(self, request, *args, **kwargs):
        module_id = self.kwargs.get('module_pk')
        if not module_id:
            return Response(
                {'error': 'Module ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        module = get_object_or_404(Module, id=module_id)
        
        # Add module to request data
        request.data['module'] = module.id
        
        return super().create(request, *args, **kwargs)
