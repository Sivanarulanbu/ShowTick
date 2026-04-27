from rest_framework import viewsets, generics, permissions, serializers
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Show, Booking, Coupon, FoodItem, FoodOrder
from theatres.models import Seat
from .serializers import ShowSerializer, BookingSerializer, FoodItemSerializer, NotificationSerializer
from rest_framework import status
from django.conf import settings
from core.tasks import send_async_email

class FoodItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FoodItem.objects.filter(is_available=True)
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.AllowAny]

class IsManagerOrAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'THEATRE_MANAGER'])

class ShowViewSet(viewsets.ModelViewSet):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsManagerOrAdminRole()]

    def get_queryset(self):
        queryset = Show.objects.select_related('movie', 'screen', 'screen__theatre').all()
        movie = self.request.query_params.get('movie', None)
        city = self.request.query_params.get('city', None)
        if movie is not None:
            queryset = queryset.filter(movie_id=movie)
        if city is not None:
            queryset = queryset.filter(screen__theatre__city__iexact=city)
        return queryset

class SeatAvailabilityView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, show_id):
        try:
            show = Show.objects.get(id=show_id)
        except Show.DoesNotExist:
            return Response({"detail": "Show not found"}, status=status.HTTP_404_NOT_FOUND)
        
        all_seats = show.screen.seats.all()
        active_bookings = Booking.objects.filter(
            show=show, 
            booking_status__in=['INITIATED', 'LOCKED', 'PAYMENT_PENDING', 'CONFIRMED']
        ).prefetch_related('seats')
        
        booked_seat_ids = set()
        for b in active_bookings:
            if not b.is_expired():
                for s in b.seats.all():
                    booked_seat_ids.add(s.id)
        
        seat_data = []
        for seat in all_seats:
            seat_data.append({
                "id": seat.id,
                "seat_number": seat.seat_number,
                "seat_type": seat.seat_type,
                "is_available": seat.id not in booked_seat_ids
            })
        return Response(seat_data)

class CreateBookingView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        show = serializer.validated_data['show']
        seats = serializer.validated_data['seats']
        
        # Concurrency safety: Lock the booking rows overlapping chosen seats
        existing_bookings = Booking.objects.select_for_update().filter(
            show=show,
            seats__in=seats,
            booking_status__in=['INITIATED', 'LOCKED', 'PAYMENT_PENDING', 'CONFIRMED']
        )
        
        for b in existing_bookings:
            if not b.is_expired():
                raise serializers.ValidationError("One or more seats are already booked or locked by another user.")
        
        ticket_total = show.price * len(seats)
        food_total = 0
        food_items_data = self.request.data.get('food_items', [])  # expected list of {id, qty}
        
        # Calculate Food costs
        food_orders_to_create = []
        for fi in food_items_data:
            try:
                food_id = fi.get('id')
                qty = fi.get('quantity', 1)
                item = FoodItem.objects.get(id=food_id)
                food_total += item.price * qty
                food_orders_to_create.append((item, qty))
            except FoodItem.DoesNotExist:
                continue

        total_amount = ticket_total + food_total
        discount_amount = 0
        
        coupon_code = self.request.data.get('coupon_code')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, active=True, 
                                            valid_from__lte=timezone.now(), 
                                            valid_to__gte=timezone.now())
                discount_amount = (total_amount * coupon.discount_percent) / 100
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid or expired coupon code."})
        
        booking = serializer.save(
            user=self.request.user,
            total_amount=total_amount - discount_amount,
            discount_amount=discount_amount,
            booking_status='INITIATED',
            expires_at=timezone.now() + timezone.timedelta(minutes=5)
        )

        for item, qty in food_orders_to_create:
            FoodOrder.objects.create(booking=booking, food_item=item, quantity=qty)

class UserBookingHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

class PaymentVerifyView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        booking_id = request.data.get('booking_id')
        payment_token = request.data.get('payment_token')
        
        try:
            booking = Booking.objects.get(ticket_id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if booking.booking_status == 'CONFIRMED':
            return Response({"detail": "Already confirmed."}, status=status.HTTP_400_BAD_REQUEST)
            
        if booking.is_expired():
            booking.booking_status = 'EXPIRED'
            booking.save()
            return Response({"detail": "Booking lock expired. Please restart."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Sandbox validation logic
        if payment_token and 'success' in payment_token.lower():
            from .models import Payment
            Payment.objects.create(
                booking=booking,
                payment_id=f"txn_{str(booking.ticket_id)[:8]}",
                status='SUCCESS',
                method='SANDBOX'
            )
            booking.booking_status = 'CONFIRMED'
            booking.save()
            
            # Add Reward Points (10 points per booking)
            user = booking.user
            user.rewards_points += 10
            user.save()

            # Create In-App Notification
            from .models import Notification
            Notification.objects.create(
                user=user,
                title="Booking Confirmed!",
                message=f"Your booking for {booking.show.movie.title} is confirmed. Enjoy your movie!"
            )

            # Send Booking Confirmation Email with PDF Attachment (Async)
            seat_numbers = ", ".join([s.seat_number for s in booking.seats.all()])
            email_context = {
                'user_name': booking.user.name,
                'movie_title': booking.show.movie.title,
                'theatre_name': booking.show.screen.theatre.name,
                'screen_number': booking.show.screen.screen_number,
                'show_time': booking.show.start_time.strftime("%B %d, %Y, %I:%M %p"),
                'seats': seat_numbers,
                'total_amount': booking.total_amount,
                'ticket_id': str(booking.ticket_id)
            }

            # Generate PDF in memory
            import io
            from xhtml2pdf import pisa
            from django.template.loader import render_to_string

            pdf_html = render_to_string('pdf/ticket.html', email_context)
            pdf_buffer = io.BytesIO()
            pisa_status = pisa.CreatePDF(pdf_html, dest=pdf_buffer)

            attachments = []
            if not pisa_status.err:
                attachments.append({
                    'filename': f'Ticket_{str(booking.ticket_id)[:8]}.pdf',
                    'content': pdf_buffer.getvalue(),
                    'mimetype': 'application/pdf'
                })

            send_async_email.delay(
                subject=f'Booking Confirmed: {booking.show.movie.title}',
                template_name='booking_confirmation',
                context=email_context,
                recipient_list=[booking.user.email],
                attachments=attachments
            )
                
            return Response({"detail": "Payment successful."})
        else:
            booking.booking_status = 'FAILED'
            booking.save()
            return Response({"detail": "Payment failed."}, status=status.HTTP_400_BAD_REQUEST)

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class AdminStatsView(generics.GenericAPIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        from django.db.models import Sum
        total_revenue = Booking.objects.filter(booking_status='CONFIRMED').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_bookings = Booking.objects.filter(booking_status='CONFIRMED').count()
        pending_bookings = Booking.objects.filter(booking_status='INITIATED').count()
        
        # Revenue by city
        city_stats = []
        from theatres.models import Theatre
        cities = Theatre.objects.values_list('city', flat=True).distinct()
        for city in cities:
            rev = Booking.objects.filter(booking_status='CONFIRMED', show__screen__theatre__city=city).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            city_stats.append({"city": city, "revenue": rev})
            
        return Response({
            "total_revenue": total_revenue,
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "city_stats": city_stats
        })

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [IsManagerOrAdminRole]

    def get_queryset(self):
        return Booking.objects.select_related('user', 'show', 'show__movie', 'show__screen', 'show__screen__theatre').prefetch_related('seats', 'food_orders', 'food_orders__food_item').all().order_by('-created_at')

class ManagerStatsView(generics.GenericAPIView):
    permission_classes = [IsManagerOrAdminRole]

    def get(self, request):
        from django.db.models import Sum
        total_revenue = Booking.objects.filter(booking_status='CONFIRMED').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_bookings = Booking.objects.filter(booking_status='CONFIRMED').count()
        
        recent_bookings = Booking.objects.filter(booking_status='CONFIRMED').order_by('-created_at')[:5]
        recent_data = BookingSerializer(recent_bookings, many=True).data
        
        return Response({
            "total_revenue": total_revenue,
            "total_bookings": total_bookings,
            "recent_activity": recent_data
        })

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "read"})
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
