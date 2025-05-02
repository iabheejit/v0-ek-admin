from django.urls import path, include
from rest_framework_nested import routers
from .views import CourseViewSet, DayViewSet, ModuleViewSet, MediaFileViewSet

# Create a router for courses
router = routers.SimpleRouter()
router.register(r'courses', CourseViewSet)

# Create a nested router for days
days_router = routers.NestedSimpleRouter(router, r'courses', lookup='course')
days_router.register(r'days', DayViewSet, basename='course-days')

# Create a nested router for modules
modules_router = routers.NestedSimpleRouter(days_router, r'days', lookup='day')
modules_router.register(r'modules', ModuleViewSet, basename='day-modules')

# Create a nested router for media files
media_router = routers.NestedSimpleRouter(modules_router, r'modules', lookup='module')
media_router.register(r'media', MediaFileViewSet, basename='module-media')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(days_router.urls)),
    path('', include(modules_router.urls)),
    path('', include(media_router.urls)),
]
