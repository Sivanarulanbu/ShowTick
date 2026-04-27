from django.db import models

class Theatre(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    location = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} - {self.city}"

class Screen(models.Model):
    theatre = models.ForeignKey(Theatre, related_name='screens', on_delete=models.CASCADE)
    screen_number = models.CharField(max_length=50)
    total_seats = models.IntegerField()

    def __str__(self):
        return f"{self.theatre.name} - Screen {self.screen_number}"

class Seat(models.Model):
    SEAT_TYPES = (
        ('VIP', 'VIP'),
        ('NORMAL', 'Normal'),
    )
    screen = models.ForeignKey(Screen, related_name='seats', on_delete=models.CASCADE)
    seat_number = models.CharField(max_length=20)
    seat_type = models.CharField(max_length=20, choices=SEAT_TYPES, default='NORMAL')

    class Meta:
        unique_together = ('screen', 'seat_number')

    def __str__(self):
        return f"{self.screen} - {self.seat_number}"
