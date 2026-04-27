from django.test import TestCase
from .models import Theatre, Screen, Seat

class TheatreModelTests(TestCase):
    def test_theatre_creation(self):
        theatre = Theatre.objects.create(name="PVR Cinema", city="Chennai", location="Velachery")
        self.assertEqual(str(theatre), "PVR Cinema - Chennai")

    def test_screen_creation(self):
        theatre = Theatre.objects.create(name="PVR Cinema", city="Chennai", location="Velachery")
        screen = Screen.objects.create(theatre=theatre, screen_number="1", total_seats=100)
        self.assertEqual(str(screen), "PVR Cinema - Screen 1")

    def test_seat_creation(self):
        theatre = Theatre.objects.create(name="PVR Cinema", city="Chennai", location="Velachery")
        screen = Screen.objects.create(theatre=theatre, screen_number="1", total_seats=100)
        seat = Seat.objects.create(screen=screen, seat_number="A1", seat_type="NORMAL")
        self.assertEqual(str(seat), "PVR Cinema - Screen 1 - A1")
