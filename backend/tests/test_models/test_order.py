from django.test import TestCase
from django.core.exceptions import ValidationError
from backend.models import Customer, Order, OrderItem, Product, Category
from decimal import Decimal
import uuid

class OrderModelTest(TestCase):
    def setUp(self):
        # Create a customer for the order
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
        
        # Create a category for products
        self.category = Category.objects.create(
            name='Test Category',
            description='Test Category Description'
        )
        
        # Create a product for order items
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST-SKU-001',
            category=self.category,
            description='Test Product Description',
            weight=Decimal('1.5'),
            dimensions='10x10x10',
            price=Decimal('29.99'),
            reorder_level=10
        )
        
        # Order data
        self.order_data = {
            'order_number': 'ORD-TEST-001',
            'customer': self.customer,
            'status': 'pending',
            'shipping_address': '123 Shipping St',
            'shipping_city': 'Shipping City',
            'shipping_state': 'Shipping State',
            'shipping_zip_code': '12345',
            'shipping_country': 'Shipping Country',
            'total_amount': Decimal('29.99'),
            'notes': 'Test order notes'
        }
        
    def test_create_order(self):
        """Test creating an order with valid data"""
        order = Order.objects.create(**self.order_data)
        self.assertEqual(order.order_number, 'ORD-TEST-001')
        self.assertEqual(order.customer, self.customer)
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.shipping_address, '123 Shipping St')
        self.assertEqual(order.shipping_city, 'Shipping City')
        self.assertEqual(order.shipping_state, 'Shipping State')
        self.assertEqual(order.shipping_zip_code, '12345')
        self.assertEqual(order.shipping_country, 'Shipping Country')
        self.assertEqual(order.total_amount, Decimal('29.99'))
        self.assertEqual(order.notes, 'Test order notes')
        self.assertIsNone(order.tracking_number)
        self.assertIsNotNone(order.order_date)
        self.assertIsNotNone(order.updated_at)
        
    def test_order_str_method(self):
        """Test the string representation of an order"""
        order = Order.objects.create(**self.order_data)
        self.assertEqual(str(order), 'ORD-TEST-001')
        
    def test_order_id_is_uuid(self):
        """Test that the order ID is a UUID"""
        order = Order.objects.create(**self.order_data)
        self.assertIsInstance(order.id, uuid.UUID)
        
    def test_order_status_choices(self):
        """Test that only valid status choices are accepted"""
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
        
        for status in valid_statuses:
            self.order_data['order_number'] = f'ORD-{status.upper()}'
            self.order_data['status'] = status
            order = Order.objects.create(**self.order_data)
            self.assertEqual(order.status, status)
        
        # Test invalid status
        self.order_data['order_number'] = 'ORD-INVALID'
        self.order_data['status'] = 'invalid_status'
        order = Order.objects.create(**self.order_data)
        
        # Django's model validation should catch this
        with self.assertRaises(ValidationError):
            order.full_clean()
            
    def test_order_number_unique(self):
        """Test that order numbers must be unique"""
        Order.objects.create(**self.order_data)
        
        # Try to create another order with the same order number
        duplicate_order = Order(
            order_number='ORD-TEST-001',  # Same order number
            customer=self.customer,
            status='processing',
            shipping_address='456 Other St',
            shipping_city='Other City',
            shipping_state='Other State',
            shipping_zip_code='54321',
            shipping_country='Other Country',
            total_amount=Decimal('19.99')
        )
        
        # This should raise an IntegrityError due to the unique constraint
        with self.assertRaises(Exception):
            duplicate_order.save()

class OrderItemModelTest(TestCase):
    def setUp(self):
        # Create a customer for the order
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
        
        # Create a category for products
        self.category = Category.objects.create(
            name='Test Category',
            description='Test Category Description'
        )
        
        # Create a product for order items
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST-SKU-001',
            category=self.category,
            description='Test Product Description',
            weight=Decimal('1.5'),
            dimensions='10x10x10',
            price=Decimal('29.99'),
            reorder_level=10
        )
        
        # Create an order
        self.order = Order.objects.create(
            order_number='ORD-TEST-001',
            customer=self.customer,
            status='pending',
            shipping_address='123 Shipping St',
            shipping_city='Shipping City',
            shipping_state='Shipping State',
            shipping_zip_code='12345',
            shipping_country='Shipping Country',
            total_amount=Decimal('59.98')
        )
        
        # Order item data
        self.order_item_data = {
            'order': self.order,
            'product': self.product,
            'quantity': 2,
            'unit_price': Decimal('29.99')
        }
        
    def test_create_order_item(self):
        """Test creating an order item with valid data"""
        order_item = OrderItem.objects.create(**self.order_item_data)
        self.assertEqual(order_item.order, self.order)
        self.assertEqual(order_item.product, self.product)
        self.assertEqual(order_item.quantity, 2)
        self.assertEqual(order_item.unit_price, Decimal('29.99'))
        
    def test_order_item_str_method(self):
        """Test the string representation of an order item"""
        order_item = OrderItem.objects.create(**self.order_item_data)
        self.assertEqual(str(order_item), 'Test Product - 2')
        
    def test_total_price_property(self):
        """Test the total_price property calculates correctly"""
        order_item = OrderItem.objects.create(**self.order_item_data)
        expected_total = Decimal('29.99') * 2
        self.assertEqual(order_item.total_price, expected_total)