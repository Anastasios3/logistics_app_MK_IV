from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from backend.models import Inventory, Warehouse, Product, Category
from decimal import Decimal
import uuid

class WarehouseModelTest(TestCase):
    def setUp(self):
        self.warehouse_data = {
            'name': 'Test Warehouse',
            'address': '123 Warehouse Street',
            'city': 'Warehouse City',
            'state': 'Warehouse State',
            'zip_code': '12345',
            'country': 'Warehouse Country',
            'contact_person': 'John Doe',
            'phone': '1234567890',
            'email': 'warehouse@example.com'
        }
        
    def test_create_warehouse(self):
        """Test creating a warehouse with valid data"""
        warehouse = Warehouse.objects.create(**self.warehouse_data)
        self.assertEqual(warehouse.name, 'Test Warehouse')
        self.assertEqual(warehouse.address, '123 Warehouse Street')
        self.assertEqual(warehouse.city, 'Warehouse City')
        self.assertEqual(warehouse.state, 'Warehouse State')
        self.assertEqual(warehouse.zip_code, '12345')
        self.assertEqual(warehouse.country, 'Warehouse Country')
        self.assertEqual(warehouse.contact_person, 'John Doe')
        self.assertEqual(warehouse.phone, '1234567890')
        self.assertEqual(warehouse.email, 'warehouse@example.com')
        self.assertIsNotNone(warehouse.created_at)
        self.assertIsNotNone(warehouse.updated_at)
        
    def test_warehouse_str_method(self):
        """Test the string representation of a warehouse"""
        warehouse = Warehouse.objects.create(**self.warehouse_data)
        self.assertEqual(str(warehouse), 'Test Warehouse')
        
    def test_warehouse_id_is_uuid(self):
        """Test that the warehouse ID is a UUID"""
        warehouse = Warehouse.objects.create(**self.warehouse_data)
        self.assertIsInstance(warehouse.id, uuid.UUID)

class InventoryModelTest(TestCase):
    def setUp(self):
        # Create a warehouse
        self.warehouse = Warehouse.objects.create(
            name='Test Warehouse',
            address='123 Warehouse Street',
            city='Warehouse City',
            state='Warehouse State',
            zip_code='12345',
            country='Warehouse Country',
            contact_person='John Doe',
            phone='1234567890',
            email='warehouse@example.com'
        )
        
        # Create a category for products
        self.category = Category.objects.create(
            name='Test Category',
            description='Test Category Description'
        )
        
        # Create a product
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
        
        # Inventory data
        self.inventory_data = {
            'product': self.product,
            'warehouse': self.warehouse,
            'quantity': 100
        }
        
    def test_create_inventory(self):
        """Test creating an inventory record with valid data"""
        inventory = Inventory.objects.create(**self.inventory_data)
        self.assertEqual(inventory.product, self.product)
        self.assertEqual(inventory.warehouse, self.warehouse)
        self.assertEqual(inventory.quantity, 100)
        self.assertIsNone(inventory.last_restock_date)
        
    def test_inventory_str_method(self):
        """Test the string representation of an inventory record"""
        inventory = Inventory.objects.create(**self.inventory_data)
        expected_str = f"{self.product.name} - {self.warehouse.name} - 100"
        self.assertEqual(str(inventory), expected_str)
        
    def test_unique_together_constraint(self):
        """Test that inventory records must be unique for product+warehouse combo"""
        # Create first inventory record
        Inventory.objects.create(**self.inventory_data)
        
        # Try to create another record for the same product and warehouse
        with self.assertRaises(IntegrityError):
            Inventory.objects.create(
                product=self.product,
                warehouse=self.warehouse,
                quantity=50  # Different quantity, but same product+warehouse
            )
            
    def test_inventory_with_multiple_products(self):
        """Test storing multiple products in the same warehouse"""
        # Create first inventory record
        Inventory.objects.create(**self.inventory_data)
        
        # Create a second product
        product2 = Product.objects.create(
            name='Another Product',
            sku='TEST-SKU-002',
            category=self.category,
            description='Another Product Description',
            weight=Decimal('2.0'),
            dimensions='20x20x20',
            price=Decimal('49.99'),
            reorder_level=5
        )
        
        # Create inventory for second product in same warehouse
        inventory2 = Inventory.objects.create(
            product=product2,
            warehouse=self.warehouse,
            quantity=50
        )
        
        self.assertEqual(inventory2.product, product2)
        self.assertEqual(inventory2.warehouse, self.warehouse)
        self.assertEqual(inventory2.quantity, 50)
        
        # Verify we have 2 inventory records
        self.assertEqual(Inventory.objects.count(), 2)