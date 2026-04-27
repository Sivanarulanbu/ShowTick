from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import Movie
from datetime import date

class MovieTests(APITestCase):
    def setUp(self):
        self.movie = Movie.objects.create(
            title="Inception",
            description="A thief who steals corporate secrets through the use of dream-sharing technology.",
            duration=148,
            language="English",
            genre="Sci-Fi",
            release_date=date(2010, 7, 16)
        )

    def test_get_movie_list(self):
        """
        Ensure we can retrieve a list of movies.
        """
        url = reverse('movie-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Inception")

    def test_get_movie_detail(self):
        """
        Ensure we can retrieve a single movie.
        """
        url = reverse('movie-detail', args=[self.movie.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Inception")

    def test_create_movie_unauthorized(self):
        """
        Ensure non-admin cannot create a movie.
        """
        from users.models import User
        user = User.objects.create_user(username='customer', email='cust@ex.com', password='pw', role='CUSTOMER')
        self.client.force_authenticate(user=user)
        
        url = reverse('movie-list')
        data = {
            'title': 'New Movie',
            'description': 'Description',
            'duration': 120,
            'language': 'English',
            'genre': 'Action',
            'release_date': '2023-01-01'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
