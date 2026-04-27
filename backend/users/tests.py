from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import User

class UserTests(APITestCase):
    def test_register_user(self):
        """
        Ensure we can create a new user object.
        """
        url = reverse('auth_register')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'name': 'Test User',
            'role': 'CUSTOMER'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')

    def test_login_user(self):
        """
        Ensure we can login and get a token.
        """
        # First register
        user = User.objects.create_user(
            username='loginuser',
            email='login@example.com',
            password='loginpassword123',
            name='Login User'
        )
        
        url = reverse('token_obtain_pair')
        data = {
            'email': 'login@example.com',
            'password': 'loginpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_me_view(self):
        """
        Ensure we can get the current user profile.
        """
        user = User.objects.create_user(
            username='meuser',
            email='me@example.com',
            password='mepassword123',
            name='Me User'
        )
        self.client.force_authenticate(user=user)
        
        url = reverse('auth_me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'me@example.com')
