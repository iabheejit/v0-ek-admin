from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, Message
from .serializers import UserSerializer, MessageSerializer
from utils.wati_service import wati_service

class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        queryset = User.objects.all()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(phone__icontains=search)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get user progress data"""
        user = self.get_object()
        
        # In a real app, you would fetch this from your database
        # This is mock data for demonstration
        modules = [
            {"day": 1, "module": 1, "status": "completed", "title": "Introduction"},
            {"day": 1, "module": 2, "status": "completed", "title": "Setting Goals"},
            {"day": 1, "module": 3, "status": "completed", "title": "Mindset Basics"},
            {"day": 2, "module": 1, "status": "completed", "title": "Building Habits"},
            {"day": 2, "module": 2, "status": "completed", "title": "Overcoming Challenges"},
            {"day": 2, "module": 3, "status": "completed", "title": "Daily Practice"},
            {"day": 3, "module": 1, "status": "completed", "title": "Advanced Techniques"},
            {"day": 3, "module": 2, "status": "in-progress", "title": "Case Studies"},
            {"day": 3, "module": 3, "status": "pending", "title": "Group Exercises"},
            {"day": 4, "module": 1, "status": "pending", "title": "Review and Reflect"},
            {"day": 4, "module": 2, "status": "pending", "title": "Application"},
            {"day": 4, "module": 3, "status": "pending", "title": "Next Steps"},
            {"day": 5, "module": 1, "status": "pending", "title": "Final Assessment"},
            {"day": 5, "module": 2, "status": "pending", "title": "Graduation"},
        ]
        
        # Calculate completion percentage
        total_modules = len(modules)
        completed_modules = sum(1 for module in modules if module["status"] == "completed")
        completion_percentage = int((completed_modules / total_modules) * 100)
        
        return Response({
            "currentDay": user.current_day,
            "currentModule": user.current_module,
            "totalDays": 5,
            "completionPercentage": completion_percentage,
            "modules": modules
        })
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get user messages"""
        user = self.get_object()
        
        # Try to get messages from WATI API first
        try:
            wati_response = wati_service.get_messages(user.phone)
            
            # Transform WATI response to match our expected format
            messages = []
            for item in wati_response.get('messages', {}).get('items', []):
                messages.append({
                    'id': item.get('id', len(messages) + 1),
                    'content': item.get('text', item.get('caption', 'Media message')),
                    'sender': 'system' if item.get('fromMe', False) else 'user',
                    'timestamp': item.get('timestamp', '')
                })
                
            return Response({'messages': messages})
            
        except Exception as e:
            # Fallback to database messages if WATI API fails
            messages = Message.objects.filter(user=user)
            serializer = MessageSerializer(messages, many=True)
            return Response({'messages': serializer.data})
    
    @action(detail=True, methods=['post'])
    def message(self, request, pk=None):
        """Send a message to a user"""
        user = self.get_object()
        message_content = request.data.get('message')
        
        if not message_content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Send message via WATI API
            wati_service.send_text(user.phone, message_content)
            
            # Save message to database
            message = Message.objects.create(
                user=user,
                content=message_content,
                is_from_user=False
            )
            
            serializer = MessageSerializer(message)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
