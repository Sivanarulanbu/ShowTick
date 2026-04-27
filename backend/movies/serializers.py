from rest_framework import serializers
from .models import Movie, Review, Watchlist
from users.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'movie', 'user', 'rating', 'comment', 'created_at']

class MovieSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'duration', 'language', 'genre', 'release_date', 'poster_url', 'poster_image', 'trailer_url', 'avg_rating', 'reviews']

class WatchlistSerializer(serializers.ModelSerializer):
    movie = serializers.PrimaryKeyRelatedField(queryset=Movie.objects.all())
    movie_details = MovieSerializer(source='movie', read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'movie', 'movie_details', 'added_at']
