from django.contrib import admin
from .models import Show, Booking, FoodItem, FoodOrder, Coupon

class FoodOrderInline(admin.TabularInline):
    model = FoodOrder
    extra = 0

@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    list_display = ('movie', 'screen', 'start_time', 'price')
    list_filter = ('start_time', 'movie')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'user', 'show', 'total_amount', 'booking_status', 'created_at')
    list_filter = ('booking_status', 'created_at')
    search_fields = ('ticket_id', 'user__email')
    inlines = [FoodOrderInline]

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_available')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'active', 'valid_to')
