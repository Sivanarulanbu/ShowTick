import uuid
from django.db import models
from django.conf import settings
from movies.models import Movie
from theatres.models import Screen, Seat
from django.utils import timezone

class Show(models.Model):
    movie = models.ForeignKey(Movie, related_name='shows', on_delete=models.CASCADE)
    screen = models.ForeignKey(Screen, related_name='shows', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.movie.title} - {self.screen} - {self.start_time}"

class Booking(models.Model):
    STATUS_CHOICES = (
        ('INITIATED', 'Initiated'),
        ('LOCKED', 'Locked'),
        ('PAYMENT_PENDING', 'Payment Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('FAILED', 'Failed'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    )
    ticket_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='bookings', on_delete=models.CASCADE)
    show = models.ForeignKey(Show, related_name='bookings', on_delete=models.CASCADE)
    seats = models.ManyToManyField(Seat, related_name='bookings')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    booking_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INITIATED')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def is_expired(self):
        if self.booking_status in ['INITIATED', 'LOCKED', 'PAYMENT_PENDING']:
            if self.expires_at and timezone.now() > self.expires_at:
                return True
        return False

    def __str__(self):
        return f"Booking {self.ticket_id} - {self.user} - {self.booking_status}"

class Coupon(models.Model):
    code = models.CharField(max_length=20, unique=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"

class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=500, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class FoodOrder(models.Model):
    booking = models.ForeignKey(Booking, related_name='food_orders', on_delete=models.CASCADE)
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.food_item.name} for {self.booking.ticket_id}"

class Payment(models.Model):
    booking = models.OneToOneField(Booking, related_name='payment', on_delete=models.CASCADE)
    payment_id = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='PENDING')
    method = models.CharField(max_length=20, default='SANDBOX')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {self.title}"
