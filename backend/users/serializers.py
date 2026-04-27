from rest_framework import serializers
from django.conf import settings
from .models import User
from core.tasks import send_async_email

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'role', 'rewards_points', 'is_staff', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        import random
        from django.utils import timezone
        from datetime import timedelta
        from django.db import IntegrityError
        import logging
        
        logger = logging.getLogger(__name__)
        otp = str(random.randint(100000, 999999))
        
        try:
            user = User.objects.create_user(
                username=validated_data['email'],
                email=validated_data['email'],
                name=validated_data['name'],
                phone=validated_data.get('phone', ''),
                role=validated_data.get('role', 'CUSTOMER'),
                password=validated_data['password'],
                is_active=False,
                otp_code=otp,
                otp_expires_at=timezone.now() + timedelta(minutes=10)
            )
            
            logger.info(f"Created inactive user {user.email}, sending OTP...")
            
            # Send OTP Verification Email (Async)
            send_async_email.delay(
                subject='Verify Your Email - ShowTick',
                template_name='otp_verification',
                context={
                    'user_name': user.name,
                    'otp_code': otp
                },
                recipient_list=[user.email]
            )
            return user
            
        except IntegrityError as e:
            logger.error(f"IntegrityError during registration for {validated_data['email']}: {e}")
            raise serializers.ValidationError({
                "email": "A user with this email or username already exists."
            })
        except Exception as e:
            logger.error(f"Unexpected error during registration: {e}")
            raise serializers.ValidationError({
                "detail": "An unexpected error occurred during registration."
            })

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'name': self.user.name,
            'role': self.user.role,
            'rewards_points': self.user.rewards_points,
        }
        return data
