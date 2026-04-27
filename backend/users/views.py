from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({"detail": "Email and OTP are required."}, status=400)
            
        try:
            user = User.objects.get(email=email, otp_code=otp)
            
            if user.otp_expires_at < timezone.now():
                return Response({"detail": "OTP has expired."}, status=400)
                
            user.is_active = True
            user.otp_code = None # Clear OTP
            user.save()
            
            return Response({"detail": "Account verified successfully. You can now login."})
        except User.DoesNotExist:
            return Response({"detail": "Invalid OTP or Email."}, status=400)

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
