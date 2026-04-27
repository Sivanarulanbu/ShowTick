from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShowViewSet, SeatAvailabilityView, CreateBookingView, 
    UserBookingHistoryView, PaymentVerifyView, AdminStatsView,
    FoodItemViewSet, BookingViewSet, ManagerStatsView,
    NotificationListView, NotificationReadView
)

router = DefaultRouter()
router.register(r'shows', ShowViewSet, basename='show')
router.register(r'food', FoodItemViewSet, basename='food')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('seats/<int:show_id>/', SeatAvailabilityView.as_view(), name='seat_availability'),
    path('create/', CreateBookingView.as_view(), name='create_booking'),
    path('history/', UserBookingHistoryView.as_view(), name='booking-history'),
    path('payment/verify/', PaymentVerifyView.as_view(), name='payment-verify'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('manager/stats/', ManagerStatsView.as_view(), name='manager-stats'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
]
