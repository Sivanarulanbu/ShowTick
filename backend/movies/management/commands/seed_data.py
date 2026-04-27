import os
from django.core.management.base import BaseCommand
from movies.models import Movie, Review
from theatres.models import Theatre, Screen, Seat
from bookings.models import Show, Coupon
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # 1. Movies
        m1, _ = Movie.objects.get_or_create(
            title="Dune: Part Two",
            defaults={
                "description": "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
                "duration": 166,
                "language": "English",
                "release_date": timezone.now().date(),
                "poster_url": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400"
            }
        )
        m2, _ = Movie.objects.get_or_create(
            title="Oppenheimer",
            defaults={
                "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
                "duration": 180,
                "language": "English",
                "release_date": timezone.now().date(),
                "poster_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400"
            }
        )

        # 2. Theatres & Screens
        t1, _ = Theatre.objects.get_or_create(name="PVR Cinemas", city="Chennai", location="VR Mall")
        t2, _ = Theatre.objects.get_or_create(name="INOX", city="Chennai", location="Citi Centre")

        s1, created = Screen.objects.get_or_create(theatre=t1, screen_number="1", defaults={"total_seats": 60})
        s2, created2 = Screen.objects.get_or_create(theatre=t2, screen_number="1", defaults={"total_seats": 60})

        # 3. Seats
        if created:
            for i in range(1, 61):
                Seat.objects.create(
                    screen=s1,
                    seat_number=f"A{i}",
                    seat_type="VIP" if i <= 10 else "NORMAL"
                )
        if created2:
            for i in range(1, 61):
                Seat.objects.create(
                    screen=s2,
                    seat_number=f"A{i}",
                    seat_type="VIP" if i <= 10 else "NORMAL"
                )

        # 4. Shows
        Show.objects.get_or_create(
            movie=m1,
            screen=s1,
            start_time=timezone.now() + timedelta(days=1, hours=2),
            defaults={"price": 250.00}
        )
        Show.objects.get_or_create(
            movie=m1,
            screen=s2,
            start_time=timezone.now() + timedelta(days=1, hours=5),
            defaults={"price": 300.00}
        )
        Show.objects.get_or_create(
            movie=m2,
            screen=s1,
            start_time=timezone.now() + timedelta(days=1, hours=8),
            defaults={"price": 250.00}
        )

        # 5. Coupons
        Coupon.objects.get_or_create(
            code="WELCOME10",
            defaults={
                "discount_percent": 10.00,
                "valid_from": timezone.now() - timedelta(days=1),
                "valid_to": timezone.now() + timedelta(days=30),
                "active": True
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
