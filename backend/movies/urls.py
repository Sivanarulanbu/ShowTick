from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, ReviewViewSet, WatchlistViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'watchlist', WatchlistViewSet, basename='watchlist')
router.register(r'', MovieViewSet, basename='movie')

urlpatterns = [
    path('', include(router.urls)),
]
