from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TheatreViewSet, ScreenViewSet, SeatViewSet

router = DefaultRouter()
router.register(r'screens', ScreenViewSet, basename='screen')
router.register(r'seats', SeatViewSet, basename='seat')
router.register(r'', TheatreViewSet, basename='theatre')

urlpatterns = [
    path('', include(router.urls)),
]
