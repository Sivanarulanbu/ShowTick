from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import Movie, Review, Watchlist
from .serializers import MovieSerializer, ReviewSerializer, WatchlistSerializer

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    filterset_fields = ['genre', 'language']
    search_fields = ['title', 'description']
    ordering_fields = ['release_date', 'avg_rating']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminRole()]

    def get_queryset(self):
        queryset = Movie.objects.all()
        city = self.request.query_params.get('city', None)
        if city:
            # Filter movies that have shows in screens belonging to theatres in this city
            queryset = queryset.filter(shows__screen__theatre__city__iexact=city).distinct()
        return queryset

    # Removed dispatch caching as it causes stale data on POST/PUT/DELETE
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Update movie avg rating
        movie = serializer.validated_data['movie']
        reviews = Review.objects.filter(movie=movie)
        avg = sum([r.rating for r in reviews]) / reviews.count()
        movie.avg_rating = avg
        movie.save()

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
