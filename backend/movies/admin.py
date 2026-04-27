from django.contrib import admin
from .models import Movie, Review, Watchlist

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'duration', 'release_date', 'avg_rating')
    search_fields = ('title',)
    list_filter = ('language', 'genre')
    inlines = [ReviewInline]

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('movie', 'user', 'rating')

@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'added_at')
