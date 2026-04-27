from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from users.models import User
from movies.models import Movie
from theatres.models import Theatre, Screen, Seat
from .models import Show, Booking
from django.utils import timezone
from datetime import date

class BookingTests(APITestCase):
    def setUp(self):
        # Create User
        self.user = User.objects.create_user(
            username='bookinguser',
            email='booking@example.com',
            password='password123',
            name='Booking User'
        )
        
        # Create Movie
        self.movie = Movie.objects.create(
            title="Inception",
            description="Dream thief",
            duration=148,
            language="English",
            genre="Sci-Fi",
            release_date=date(2010, 7, 16)
        )
        
        # Create Theatre, Screen, Seat
        self.theatre = Theatre.objects.create(name="PVR Chennai", city="Chennai", location="Velachery")
        self.screen = Screen.objects.create(theatre=self.theatre, screen_number="1", total_seats=100)
        self.seat = Seat.objects.create(screen=self.screen, seat_number="A1", seat_type="NORMAL")
        
        # Create Show
        self.show = Show.objects.create(
            movie=self.movie,
            screen=self.screen,
            start_time=timezone.now() + timezone.timedelta(days=1),
            price=200.00
        )

    def test_create_booking(self):
        """
        Ensure we can create a booking.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('create_booking')
        data = {
            'show': self.show.id,
            'seats': [self.seat.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(Booking.objects.get().total_amount, 200.00)

    def test_double_booking_prevention(self):
        """
        Ensure we cannot book the same seat twice.
        """
        # First booking
        Booking.objects.create(
            user=self.user,
            show=self.show,
            total_amount=200.00,
            booking_status='CONFIRMED'
        ).seats.add(self.seat)
        
        # Second attempt
        self.client.force_authenticate(user=self.user)
        url = reverse('create_booking')
        data = {
            'show': self.show.id,
            'seats': [self.seat.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
