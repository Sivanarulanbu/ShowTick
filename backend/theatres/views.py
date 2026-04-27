from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Theatre
from .serializers import TheatreSerializer
from rest_framework.permissions import AllowAny, BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class TheatreViewSet(viewsets.ModelViewSet):
    serializer_class = TheatreSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminRole()]

    def get_queryset(self):
        queryset = Theatre.objects.all()
        city = self.request.query_params.get('city', None)
        if city is not None:
            queryset = queryset.filter(city__iexact=city)
        return queryset

class IsManagerOrAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'THEATRE_MANAGER'])

class ScreenViewSet(viewsets.ModelViewSet):
    from .serializers import ScreenSerializer
    serializer_class = ScreenSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsManagerOrAdminRole()]

    def get_queryset(self):
        from .models import Screen
        queryset = Screen.objects.all()
        theatre = self.request.query_params.get('theatre', None)
        if theatre is not None:
            queryset = queryset.filter(theatre_id=theatre)
        return queryset

class SeatViewSet(viewsets.ModelViewSet):
    from .serializers import SeatSerializer
    serializer_class = SeatSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsManagerOrAdminRole()]

    def get_queryset(self):
        from .models import Seat
        queryset = Seat.objects.all()
        screen = self.request.query_params.get('screen', None)
        if screen is not None:
            queryset = queryset.filter(screen_id=screen)
        return queryset

    @action(detail=False, methods=['post'], permission_classes=[IsManagerOrAdminRole])
    def bulk_create(self, request):
        screen_id = request.data.get('screen_id')
        rows = request.data.get('rows') # ['A', 'B', 'C']
        seats_per_row = request.data.get('seats_per_row') # 10
        seat_type = request.data.get('seat_type', 'NORMAL')

        if not screen_id or not rows or not seats_per_row:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        from .models import Screen, Seat
        try:
            screen = Screen.objects.get(id=screen_id)
        except Screen.DoesNotExist:
            return Response({"error": "Screen not found"}, status=status.HTTP_404_NOT_FOUND)

        seats_to_create = []
        for row in rows:
            for i in range(1, seats_per_row + 1):
                seat_num = f"{row}{i}"
                if not Seat.objects.filter(screen=screen, seat_number=seat_num).exists():
                    seats_to_create.append(Seat(screen=screen, seat_number=seat_num, seat_type=seat_type))
        
        Seat.objects.bulk_create(seats_to_create)
        return Response({"message": f"Successfully created {len(seats_to_create)} seats"}, status=status.HTTP_201_CREATED)
