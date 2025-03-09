import axios from 'axios';
import { authService, orderService, inventoryService, shipmentService } from '../api';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('API Service', () => {
  // Clear mocks and localStorage before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.location.href = '';
  });

  describe('Auth Service', () => {
    describe('login', () => {
      it('should store tokens and user data on successful login', async () => {
        // Mock response
        const mockResponse = {
          data: {
            access: 'test-access-token',
            refresh: 'test-refresh-token',
            user: { id: 1, username: 'testuser', user_type: 'staff' }
          }
        };
        
        axios.post.mockResolvedValueOnce(mockResponse);
        
        // Test login method
        const credentials = { username: 'testuser', password: 'password' };
        const result = await authService.login(credentials);
        
        // Assertions
        expect(axios.post).toHaveBeenCalledWith('/auth/login/', credentials);
        expect(localStorage.getItem('authToken')).toBe('test-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
        expect(result).toEqual({ user: mockResponse.data.user });
      });
      
      it('should throw an error when login fails', async () => {
        // Mock a failed response
        const errorResponse = { 
          response: { 
            data: { message: 'Invalid credentials' } 
          } 
        };
        
        axios.post.mockRejectedValueOnce(errorResponse);
        
        // Test login method with error
        const credentials = { username: 'testuser', password: 'wrong-password' };
        
        await expect(authService.login(credentials)).rejects.toEqual(errorResponse);
        
        // Assertions
        expect(axios.post).toHaveBeenCalledWith('/auth/login/', credentials);
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });
    
    describe('logout', () => {
      it('should remove tokens and user data from localStorage', () => {
        // Setup localStorage with tokens and user data
        localStorage.setItem('authToken', 'test-access-token');
        localStorage.setItem('refreshToken', 'test-refresh-token');
        localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));
        
        // Call logout
        authService.logout();
        
        // Assertions
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
      
      it('should redirect to login page if not already there', () => {
        // Setup logout from a non-login page
        window.location.pathname = '/dashboard';
        
        // Call logout
        authService.logout();
        
        // Assert redirection
        expect(window.location.href).toBe('/login');
      });
      
      it('should not redirect if already on login page', () => {
        // Setup logout from login page
        window.location.pathname = '/login';
        
        // Call logout
        authService.logout();
        
        // Assert no redirection
        expect(window.location.href).not.toBe('/login');
      });
    });
    
    describe('getCurrentUser', () => {
      it('should return user data from localStorage', () => {
        // Setup localStorage with user data
        const userData = { id: 1, username: 'testuser', user_type: 'staff' };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Get current user
        const result = authService.getCurrentUser();
        
        // Assertions
        expect(result).toEqual(userData);
      });
      
      it('should return null when no user data in localStorage', () => {
        // Ensure no user data in localStorage
        localStorage.removeItem('user');
        
        // Get current user
        const result = authService.getCurrentUser();
        
        // Assertions
        expect(result).toBeNull();
      });
    });
  });
  
  describe('Order Service', () => {
    describe('getOrders', () => {
      it('should fetch orders with provided parameters', async () => {
        // Mock response
        const mockResponse = {
          data: {
            count: 2,
            next: null,
            previous: null,
            results: [
              { id: '1', order_number: 'ORD-001', status: 'pending' },
              { id: '2', order_number: 'ORD-002', status: 'delivered' }
            ]
          }
        };
        
        axios.get.mockResolvedValueOnce(mockResponse);
        
        // Call getOrders with params
        const params = { status: 'all', page: 1, limit: 10 };
        const result = await orderService.getOrders(params);
        
        // Assertions
        expect(axios.get).toHaveBeenCalledWith('/orders/', { params });
        expect(result).toEqual(mockResponse.data);
      });
    });
    
    describe('getOrderById', () => {
      it('should fetch an order by ID', async () => {
        // Mock response
        const mockResponse = {
          data: {
            id: '1',
            order_number: 'ORD-001',
            status: 'pending',
            total_amount: '29.99',
            items: [
              { id: '1', product: { name: 'Test Product' }, quantity: 1, unit_price: '29.99' }
            ]
          }
        };
        
        axios.get.mockResolvedValueOnce(mockResponse);
        
        // Call getOrderById
        const orderId = '1';
        const result = await orderService.getOrderById(orderId);
        
        // Assertions
        expect(axios.get).toHaveBeenCalledWith(`/orders/${orderId}/`);
        expect(result).toEqual(mockResponse.data);
      });
    });
    
    describe('createOrder', () => {
      it('should create a new order', async () => {
        // Mock response
        const mockResponse = {
          data: {
            id: '1',
            order_number: 'ORD-001',
            status: 'pending',
            total_amount: '29.99'
          }
        };
        
        axios.post.mockResolvedValueOnce(mockResponse);
        
        // Order data
        const orderData = {
          customer_id: '1',
          items: [{ product_id: '1', quantity: 1 }],
          shipping_address: '123 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip_code: '12345',
          shipping_country: 'Test Country'
        };
        
        // Call createOrder
        const result = await orderService.createOrder(orderData);
        
        // Assertions
        expect(axios.post).toHaveBeenCalledWith('/orders/', orderData);
        expect(result).toEqual(mockResponse.data);
      });
    });
  });
  
  describe('Inventory Service', () => {
    describe('getProducts', () => {
      it('should fetch products with provided parameters', async () => {
        // Mock response
        const mockResponse = {
          data: {
            count: 2,
            next: null,
            previous: null,
            results: [
              { id: '1', name: 'Product 1', sku: 'SKU-001', price: '29.99' },
              { id: '2', name: 'Product 2', sku: 'SKU-002', price: '39.99' }
            ]
          }
        };
        
        axios.get.mockResolvedValueOnce(mockResponse);
        
        // Call getProducts with params
        const params = { category: 'all', page: 1, limit: 10 };
        const result = await inventoryService.getProducts(params);
        
        // Assertions
        expect(axios.get).toHaveBeenCalledWith('/products/', { params });
        expect(result).toEqual(mockResponse.data);
      });
    });
    
    describe('getLowStockItems', () => {
      it('should fetch low stock items', async () => {
        // Mock response
        const mockResponse = {
          data: [
            { 
              product: { id: '1', name: 'Low Stock Product', sku: 'SKU-001' },
              warehouse: { id: '1', name: 'Main Warehouse' },
              quantity: 5,
              reorder_level: 10
            }
          ]
        };
        
        axios.get.mockResolvedValueOnce(mockResponse);
        
        // Call getLowStockItems
        const result = await inventoryService.getLowStockItems();
        
        // Assertions
        expect(axios.get).toHaveBeenCalledWith('/inventory/low-stock/');
        expect(result).toEqual(mockResponse.data);
      });
    });
  });
});