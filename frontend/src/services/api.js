import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and not already retrying
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, logout user
          handleLogout();
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        
        // Store the new token
        localStorage.setItem('authToken', access);
        
        // Update the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout user
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Handle logout
const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // If we need to redirect, we can do it here, 
  // but we need to make sure we're not calling this in a loop
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Authentication services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('authToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user };
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  logout: () => {
    handleLogout();
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/password-reset/', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/password-reset/confirm/', {
      token,
      password,
    });
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile/', userData);
    
    // Update stored user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },
};

// Order services
export const orderService = {
  getOrders: async (params) => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },
  
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}/`, orderData);
    return response.data;
  },
  
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}/`);
    return response.data;
  },
  
  getOrderStatistics: async (params) => {
    const response = await api.get('/orders/statistics/', { params });
    return response.data;
  },
};

// Product and Inventory services
export const inventoryService = {
  getProducts: async (params) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },
  
  createProduct: async (productData) => {
    const formData = new FormData();
    
    // Convert productData to FormData to handle file uploads
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append(key, productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });
    
    const response = await api.post('/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  updateProduct: async (id, productData) => {
    const formData = new FormData();
    
    // Convert productData to FormData to handle file uploads
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append(key, productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });
    
    const response = await api.put(`/products/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}/`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },
  
  // Inventory management
  getInventory: async (params) => {
    const response = await api.get('/inventory/', { params });
    return response.data;
  },
  
  updateInventory: async (id, data) => {
    const response = await api.put(`/inventory/${id}/`, data);
    return response.data;
  },
  
  transferStock: async (data) => {
    const response = await api.post('/inventory/transfer/', data);
    return response.data;
  },
  
  getLowStockItems: async () => {
    const response = await api.get('/inventory/low-stock/');
    return response.data;
  },
  
  // Warehouse management
  getWarehouses: async () => {
    const response = await api.get('/warehouses/');
    return response.data;
  },
  
  getWarehouseById: async (id) => {
    const response = await api.get(`/warehouses/${id}/`);
    return response.data;
  },
  
  createWarehouse: async (data) => {
    const response = await api.post('/warehouses/', data);
    return response.data;
  },
  
  updateWarehouse: async (id, data) => {
    const response = await api.put(`/warehouses/${id}/`, data);
    return response.data;
  },
  
  deleteWarehouse: async (id) => {
    const response = await api.delete(`/warehouses/${id}/`);
    return response.data;
  },
};

// Shipment services
export const shipmentService = {
  getShipments: async (params) => {
    const response = await api.get('/shipments/', { params });
    return response.data;
  },
  
  getShipmentById: async (id) => {
    const response = await api.get(`/shipments/${id}/`);
    return response.data;
  },
  
  createShipment: async (shipmentData) => {
    const response = await api.post('/shipments/', shipmentData);
    return response.data;
  },
  
  updateShipment: async (id, shipmentData) => {
    const response = await api.put(`/shipments/${id}/`, shipmentData);
    return response.data;
  },
  
  deleteShipment: async (id) => {
    const response = await api.delete(`/shipments/${id}/`);
    return response.data;
  },
  
  getShipmentTracking: async (id) => {
    const response = await api.get(`/shipments/${id}/tracking/`);
    return response.data;
  },
  
  addTrackingUpdate: async (id, updateData) => {
    const response = await api.post(`/shipments/${id}/tracking/`, updateData);
    return response.data;
  },
  
  getVehicles: async () => {
    const response = await api.get('/vehicles/');
    return response.data;
  },
  
  getDrivers: async () => {
    const response = await api.get('/drivers/');
    return response.data;
  },
};

// Customer services
export const customerService = {
  getCustomers: async (params) => {
    const response = await api.get('/customers/', { params });
    return response.data;
  },
  
  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}/`);
    return response.data;
  },
  
  createCustomer: async (customerData) => {
    const response = await api.post('/customers/', customerData);
    return response.data;
  },
  
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}/`, customerData);
    return response.data;
  },
  
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}/`);
    return response.data;
  },
  
  getCustomerOrders: async (id, params) => {
    const response = await api.get(`/customers/${id}/orders/`, { params });
    return response.data;
  },
};

// Supplier services
export const supplierService = {
  getSuppliers: async (params) => {
    const response = await api.get('/suppliers/', { params });
    return response.data;
  },
  
  getSupplierById: async (id) => {
    const response = await api.get(`/suppliers/${id}/`);
    return response.data;
  },
  
  createSupplier: async (supplierData) => {
    const response = await api.post('/suppliers/', supplierData);
    return response.data;
  },
  
  updateSupplier: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}/`, supplierData);
    return response.data;
  },
  
  deleteSupplier: async (id) => {
    const response = await api.delete(`/suppliers/${id}/`);
    return response.data;
  },
};

// Report services
export const reportService = {
  getSalesReport: async (params) => {
    const response = await api.get('/reports/sales/', { params });
    return response.data;
  },
  
  getInventoryReport: async (params) => {
    const response = await api.get('/reports/inventory/', { params });
    return response.data;
  },
  
  getShipmentsReport: async (params) => {
    const response = await api.get('/reports/shipments/', { params });
    return response.data;
  },
  
  exportReport: async (reportType, params) => {
    const response = await api.get(`/reports/${reportType}/export/`, {
      params,
      responseType: 'blob',
    });
    
    // Create file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'report.csv';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  },
};

// Dashboard services
export const dashboardService = {
  getStatistics: async (params) => {
    const response = await api.get('/dashboard/statistics/', { params });
    return response.data;
  },
  
  getRecentOrders: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-orders/', {
      params: { limit },
    });
    return response.data;
  },
  
  getLowStockItems: async (limit = 5) => {
    const response = await api.get('/dashboard/low-stock/', {
      params: { limit },
    });
    return response.data;
  },
  
  getPendingShipments: async (limit = 5) => {
    const response = await api.get('/dashboard/pending-shipments/', {
      params: { limit },
    });
    return response.data;
  },
  
  getMonthlyOrders: async (months = 6) => {
    const response = await api.get('/dashboard/monthly-orders/', {
      params: { months },
    });
    return response.data;
  },
  
  getMonthlyRevenue: async (months = 6) => {
    const response = await api.get('/dashboard/monthly-revenue/', {
      params: { months },
    });
    return response.data;
  },
  
  getOrderStatusDistribution: async () => {
    const response = await api.get('/dashboard/order-status-distribution/');
    return response.data;
  },
  
  getTopSellingProducts: async (limit = 5) => {
    const response = await api.get('/dashboard/top-selling-products/', {
      params: { limit },
    });
    return response.data;
  },
};

export default api;