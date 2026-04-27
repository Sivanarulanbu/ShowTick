from rest_framework import serializers
from .models import Show, Booking, FoodItem, FoodOrder, Notification

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'

class FoodOrderSerializer(serializers.ModelSerializer):
    food_item_details = FoodItemSerializer(source='food_item', read_only=True)
    class Meta:
        model = FoodOrder
        fields = ['id', 'food_item', 'food_item_details', 'quantity']

class ShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Show
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        from movies.serializers import MovieSerializer
        from theatres.serializers import ScreenSerializer, TheatreSerializer
        
        movie_data = MovieSerializer(instance.movie).data
        screen_data = ScreenSerializer(instance.screen).data
        screen_data['theatre'] = TheatreSerializer(instance.screen.theatre).data
        
        representation['movie'] = movie_data
        representation['screen'] = screen_data
        
        # Keep for ManagerDashboard compatibility
        representation['movie_details'] = movie_data
        representation['screen_details'] = screen_data
        representation['screen_details']['theatre_name'] = instance.screen.theatre.name
        
        return representation

class BookingSerializer(serializers.ModelSerializer):
    food_orders = FoodOrderSerializer(many=True, read_only=True)
    class Meta:
        model = Booking
        fields = ['id', 'ticket_id', 'user', 'show', 'seats', 'total_amount', 'discount_amount', 'booking_status', 'created_at', 'expires_at', 'food_orders']
        read_only_fields = ['user', 'total_amount', 'booking_status']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['show'] = ShowSerializer(instance.show).data
        from theatres.serializers import SeatSerializer
        representation['seats'] = SeatSerializer(instance.seats.all(), many=True).data
        representation['user_email'] = instance.user.email
        representation['user_name'] = instance.user.get_full_name() or instance.user.username
        return representation

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
