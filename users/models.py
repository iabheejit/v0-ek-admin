from django.db import models

class User(models.Model):
    """Model representing a WhatsApp user"""
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    joined_date = models.DateTimeField(auto_now_add=True)
    current_day = models.IntegerField(default=1)
    current_module = models.IntegerField(default=1)
    last_active = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('inactive', 'Inactive'),
        ],
        default='active'
    )
    course = models.CharField(max_length=255, default='Mindset Training')
    
    def __str__(self):
        return f"{self.name} ({self.phone})"
    
    @property
    def initials(self):
        """Get user initials for avatar"""
        words = self.name.split()
        initials = ""
        for word in words[:2]:
            if word:
                initials += word[0].upper()
        return initials or "U"
    
    @property
    def last_active_display(self):
        """Get human-readable last active time"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - self.last_active
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"


class Message(models.Model):
    """Model representing a message between the system and a user"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_from_user = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        direction = "from" if self.is_from_user else "to"
        return f"Message {direction} {self.user.name} at {self.timestamp}"
    
    @property
    def sender(self):
        return "user" if self.is_from_user else "system"
    
    @property
    def timestamp_display(self):
        return self.timestamp.strftime("%I:%M %p")
