from django.db import models
from django.conf import settings

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField()  # in minutes
    language = models.CharField(max_length=100)
    genre = models.CharField(max_length=100, default='Drama')
    release_date = models.DateField()
    poster_url = models.URLField(max_length=500, blank=True)
    poster_image = models.ImageField(upload_to='posters/', blank=True, null=True)
    trailer_url = models.URLField(max_length=500, blank=True, null=True)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)

    def __str__(self):
        return self.title

class Watchlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='watchlist', on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

class Review(models.Model):
    movie = models.ForeignKey(Movie, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('movie', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.movie.title} ({self.rating})"
