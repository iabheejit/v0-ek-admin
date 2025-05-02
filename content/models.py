from django.db import models

class Course(models.Model):
    """Model representing a course"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Day(models.Model):
    """Model representing a day in a course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='days')
    day_number = models.IntegerField()
    topic = models.CharField(max_length=255)
    
    class Meta:
        unique_together = ['course', 'day_number']
        ordering = ['day_number']
    
    def __str__(self):
        return f"{self.course.name} - Day {self.day_number}"

class Module(models.Model):
    """Model representing a module within a day"""
    day = models.ForeignKey(Day, on_delete=models.CASCADE, related_name='modules')
    module_number = models.IntegerField()
    title = models.CharField(max_length=255)
    text = models.TextField(blank=True)
    question = models.TextField(blank=True)
    answer_options = models.JSONField(default=list)
    correct_answer = models.CharField(max_length=255, blank=True)
    next_action = models.CharField(
        max_length=20,
        choices=[
            ('next-module', 'Next Module'),
            ('finish-day', 'Finish Day'),
            ('custom', 'Custom Message'),
        ],
        default='next-module'
    )
    
    class Meta:
        unique_together = ['day', 'module_number']
        ordering = ['module_number']
    
    def __str__(self):
        return f"{self.day} - Module {self.module_number}: {self.title}"

class MediaFile(models.Model):
    """Model representing a media file for a module"""
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='media_files')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='course_media/')
    file_type = models.CharField(
        max_length=10,
        choices=[
            ('image', 'Image'),
            ('video', 'Video'),
            ('audio', 'Audio'),
            ('document', 'Document'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.file_type})"
