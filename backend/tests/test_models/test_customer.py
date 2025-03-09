from django.test import TestCase
from django.core.exceptions import ValidationError
from backend.models import Customer
import uuid

class CustomerModelTest(TestCase):
    def setUp(self):
        self.customer_data = {
            'name': 'Test Customer',
            'email': 'customer@example.com',
            'phone': '1234567890',
            'address': '123 Test Avenue',
            'city': 'Test City',
            'state': 'Test State',
            'zip_code': '12345',
            'country': 'Test Country'
        }
        
    def test_create_customer(self):
        """Test creating a customer with valid data"""
        customer = Customer.objects.create(**self.customer_data)
        self.assertEqual(customer.name, 'Test Customer')
        self.assertEqual(customer.email, 'customer@example.com')
        self.assertEqual(customer.phone, '1234567890')
        self.assertEqual(customer.address, '123 Test Avenue')
        self.assertEqual(customer.city, 'Test City')
        self.assertEqual(customer.state, 'Test State')
        self.assertEqual(customer.zip_code, '12345')
        self.assertEqual(customer.country, 'Test Country')
        self.assertIsNotNone(customer.created_at)
        self.assertIsNotNone(customer.updated_at)
        
    def test_customer_str_method(self):
        """Test the string representation of a customer"""
        customer = Customer.objects.create(**self.customer_data)
        self.assertEqual(str(customer), 'Test Customer')
        
    def test_customer_id_is_uuid(self):
        """Test that the customer ID is a UUID"""
        customer = Customer.objects.create(**self.customer_data)
        self.assertIsInstance(customer.id, uuid.UUID)
        
    def test_customer_email_unique(self):
        """Test that customers must have unique emails"""
        Customer.objects.create(**self.customer_data)
        
        # Try to create another customer with the same email
        duplicate_customer = Customer(
            name='Another Customer',
            email='customer@example.com',  # Same email as first customer
            phone='0987654321',
            address='456 Test Boulevard',
            city='Another City',
            state='Another State',
            zip_code='54321',
            country='Another Country'
        )
        
        # This should raise an IntegrityError due to the unique constraint on email
        with self.assertRaises(Exception):
            duplicate_customer.save()