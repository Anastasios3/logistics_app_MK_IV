import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import store from './store';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth
import Login from './pages/Auth/Login';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import { OrdersList, OrderDetail, OrderForm } from './pages/Orders';
import { InventoryList } from './pages/Inventory';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // In a real app, this would check authentication state
  // For now, we'll simulate authentication with localStorage
  const isAuthenticated = localStorage.getItem('mockAuthToken') || false;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Create theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
});

function App() {
  const handleLogin = () => {
    // Simulate login for demo purposes
    localStorage.setItem('mockAuthToken', 'demo-token');
    localStorage.setItem('mockUserData', JSON.stringify({
      id: '1',
      username: 'admin',
      fullName: 'Demo Admin',
      email: 'admin@example.com',
      role: 'admin'
    }));
    window.location.href = '/dashboard';
  };
  
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login onLoginClick={handleLogin} />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Route>
              
              {/* Protected Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Orders Routes */}
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/orders/new" element={<OrderForm />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/orders/:id/edit" element={<OrderForm />} />
                
                {/* Inventory Routes */}
                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/inventory/products/new" element={<InventoryList />} />
                <Route path="/inventory/products/:id" element={<InventoryList />} />
                <Route path="/inventory/products/:id/edit" element={<InventoryList />} />
                <Route path="/inventory/update/:id" element={<InventoryList />} />
                <Route path="/inventory/transfer/:id" element={<InventoryList />} />
                <Route path="/inventory/low-stock" element={<InventoryList />} />
                
                {/* Add routes for other modules here */}
              </Route>
              
              {/* Redirect all other routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;