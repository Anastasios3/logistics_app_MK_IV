from django.test import TestCase
from django.core.exceptions import ValidationError
from backend.models import User

class UserModelTest(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepassword123',
            'first_name': 'Test',
            'last_name': 'User',
            'user_type': 'staff',
            'phone': '1234567890',
            'address': '123 Test Street'
        }
        
    def test_create_user(self):
        """Test creating a user with valid data"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.first_name, 'Test')
        self.assertEqual(user.last_name, 'User')
        self.assertEqual(user.user_type, 'staff')
        self.assertEqual(user.phone, '1234567890')
        self.assertEqual(user.address, '123 Test Street')
        self.assertTrue(user.check_password('securepassword123'))
        
    def test_user_str_method(self):
        """Test the string representation of a user"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(str(user), 'testuser')
        
    def test_user_types(self):
        """Test creating users with different user types"""
        for user_type in ['admin', 'manager', 'staff', 'driver', 'customer']:
            self.user_data['username'] = f'test_{user_type}'
            self.user_data['email'] = f'{user_type}@example.com'
            self.user_data['user_type'] = user_type
            
            user = User.objects.create_user(**self.user_data)
            self.assertEqual(user.user_type, user_type)
            
    def test_invalid_user_type(self):
        """Test that an invalid user type raises a validation error"""
        self.user_data['user_type'] = 'invalid_type'
        user = User.objects.create_user(**self.user_data)
        
        # Django's model validation should catch this
        with self.assertRaises(ValidationError):
            user.full_clean()