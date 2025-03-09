from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from backend.models import Shipment, Order, Customer, Driver, Vehicle, User, ShipmentTracking
from decimal import Decimal
import uuid

class ShipmentModelTest(TestCase):
    def setUp(self):
        # Create a user for the driver
        self.user = User.objects.create_user(
            username='driveruser',
            email='driver@example.com',
            password='securepassword123',
            first_name='Driver',
            last_name='User',
            user_type='driver',
            phone='1234567890'
        )
        
        # Create a driver
        self.driver = Driver.objects.create(
            user=self.user,
            license_number='DL12345678',
            license_expiry_date=timezone.now().date() + timedelta(days=365)
        )
        
        # Create a vehicle
        self.vehicle = Vehicle.objects.create(
            vehicle_number='VEH-001',
            vehicle_type='truck',
            make='Ford',
            model='F-150',
            year=2022,
            license_plate='ABC123',
            capacity=Decimal('1500'),
            status='available'
        )
        
        # Create a customer
        self.customer = Customer.objects.create(
            name='Test Customer',
            email='customer@example.com',
            phone='1234567890',
            address='123 Test Avenue',
            city='Test City',
            state='Test State',
            zip_code='12345',
            country='Test Country'
        )
        
        # Create an order
        self.order = Order.objects.create(
            order_number='ORD-TEST-001',
            customer=self.customer,
            status='processing',
            shipping_address='123 Shipping St',
            shipping_city='Shipping City',
            shipping_state='Shipping State',
            shipping_zip_code='12345',
            shipping_country='Shipping Country',
            total_amount=Decimal('29.99')
        )
        
        # Shipment data
        self.shipment_data = {
            'shipment_number': 'SHP-TEST-001',
            'order': self.order,
            'driver': self.driver,
            'vehicle': self.vehicle,
            'status': 'pending',
            'departure_time': timezone.now() + timedelta(days=1),
            'estimated_arrival': timezone.now() + timedelta(days=2),
            'notes': 'Test shipment notes'
        }
        
    def test_create_shipment(self):
        """Test creating a shipment with valid data"""
        shipment = Shipment.objects.create(**self.shipment_data)
        
        self.assertEqual(shipment.shipment_number, 'SHP-TEST-001')
        self.assertEqual(shipment.order, self.order)
        self.assertEqual(shipment.driver, self.driver)
        self.assertEqual(shipment.vehicle, self.vehicle)
        self.assertEqual(shipment.status, 'pending')
        self.assertIsNotNone(shipment.departure_time)
        self.assertIsNotNone(shipment.estimated_arrival)
        self.assertIsNone(shipment.actual_arrival)
        self.assertEqual(shipment.notes, 'Test shipment notes')
        self.assertIsNotNone(shipment.created_at)
        self.assertIsNotNone(shipment.updated_at)
        
    def test_shipment_str_method(self):
        """Test the string representation of a shipment"""
        shipment = Shipment.objects.create(**self.shipment_data)
        self.assertEqual(str(shipment), 'SHP-TEST-001')
        
    def test_shipment_id_is_uuid(self):
        """Test that the shipment ID is a UUID"""
        shipment = Shipment.objects.create(**self.shipment_data)
        self.assertIsInstance(shipment.id, uuid.UUID)
        
    def test_shipment_status_choices(self):
        """Test that only valid status choices are accepted"""
        valid_statuses = ['pending', 'in_transit', 'delivered', 'failed']
        
        for status in valid_statuses:
            self.shipment_data['shipment_number'] = f'SHP-{status.upper()}'
            self.shipment_data['status'] = status
            shipment = Shipment.objects.create(**self.shipment_data)
            self.assertEqual(shipment.status, status)
        
        # Test invalid status
        self.shipment_data['shipment_number'] = 'SHP-INVALID'
        self.shipment_data['status'] = 'invalid_status'
        shipment = Shipment.objects.create(**self.shipment_data)
        
        # Django's model validation should catch this
        with self.assertRaises(ValidationError):
            shipment.full_clean()
            
    def test_shipment_number_unique(self):
        """Test that shipment numbers must be unique"""
        Shipment.objects.create(**self.shipment_data)
        
        # Try to create another shipment with the same shipment number
        duplicate_shipment = Shipment(
            shipment_number='SHP-TEST-001',  # Same shipment number
            order=self.order,
            status='in_transit',
            departure_time=timezone.now(),
            estimated_arrival=timezone.now() + timedelta(hours=12)
        )
        
        # This should raise an IntegrityError due to the unique constraint
        with self.assertRaises(Exception):
            duplicate_shipment.save()
            
    def test_shipment_without_driver_and_vehicle(self):
        """Test creating a shipment without a driver and vehicle"""
        # Remove driver and vehicle
        self.shipment_data.pop('driver')
        self.shipment_data.pop('vehicle')
        self.shipment_data['shipment_number'] = 'SHP-TEST-002'
        
        shipment = Shipment.objects.create(**self.shipment_data)
        
        self.assertEqual(shipment.shipment_number, 'SHP-TEST-002')
        self.assertEqual(shipment.order, self.order)
        self.assertIsNone(shipment.driver)
        self.assertIsNone(shipment.vehicle)
        self.assertEqual(shipment.status, 'pending')
        
class ShipmentTrackingModelTest(TestCase):
    def setUp(self):
        # Create a customer
        self.customer = Customer.objects.create(
            name='Test Customer',
            email='customer@example.com',
            phone='1234567890',
            address='123 Test Avenue',
            city='Test City',
            state='Test State',
            zip_code='12345',
            country='Test Country'
        )
        
        # Create an order
        self.order = Order.objects.create(
            order_number='ORD-TEST-001',
            customer=self.customer,
            status='processing',
            shipping_address='123 Shipping St',
            shipping_city='Shipping City',
            shipping_state='Shipping State',
            shipping_zip_code='12345',
            shipping_country='Shipping Country',
            total_amount=Decimal('29.99')
        )
        
        # Create a shipment
        self.shipment = Shipment.objects.create(
            shipment_number='SHP-TEST-001',
            order=self.order,
            status='pending',
            departure_time=timezone.now() + timedelta(days=1),
            estimated_arrival=timezone.now() + timedelta(days=2)
        )
        
        # Tracking data
        self.tracking_data = {
            'shipment': self.shipment,
            'location': 'Warehouse A',
            'status': 'Package prepared for shipment',
            'notes': 'Package has been processed and is ready for pickup'
        }
        
    def test_create_tracking_update(self):
        """Test creating a tracking update with valid data"""
        tracking = ShipmentTracking.objects.create(**self.tracking_data)
        
        self.assertEqual(tracking.shipment, self.shipment)
        self.assertEqual(tracking.location, 'Warehouse A')
        self.assertEqual(tracking.status, 'Package prepared for shipment')
        self.assertEqual(tracking.notes, 'Package has been processed and is ready for pickup')
        self.assertIsNotNone(tracking.timestamp)
        
    def test_tracking_str_method(self):
        """Test the string representation of a tracking update"""
        tracking = ShipmentTracking.objects.create(**self.tracking_data)
        expected_str = f"{self.shipment.shipment_number} - {tracking.timestamp}"
        self.assertEqual(str(tracking), expected_str)
        
    def test_multiple_tracking_updates(self):
        """Test adding multiple tracking updates to a shipment"""
        # First update
        tracking1 = ShipmentTracking.objects.create(**self.tracking_data)
        
        # Second update
        tracking2 = ShipmentTracking.objects.create(
            shipment=self.shipment,
            location='Distribution Center',
            status='In transit',
            notes='Package has left the warehouse'
        )
        
        # Third update
        tracking3 = ShipmentTracking.objects.create(
            shipment=self.shipment,
            location='Local Delivery Facility',
            status='Out for delivery',
            notes='Package is out for delivery'
        )
        
        # Get all tracking updates for the shipment
        tracking_updates = self.shipment.tracking_updates.all().order_by('timestamp')
        
        # Should have 3 updates
        self.assertEqual(tracking_updates.count(), 3)
        
        # Check order is by timestamp
        self.assertEqual(tracking_updates[0].status, 'Package prepared for shipment')
        self.assertEqual(tracking_updates[1].status, 'In transit')
        self.assertEqual(tracking_updates[2].status, 'Out for delivery')