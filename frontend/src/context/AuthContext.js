import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Create context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // On mount, check if user is logged in
  useEffect(() => {
    const initAuth = () => {
      try {
        // Check for token and user in local storage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Get user data from localStorage
          const userData = authService.getCurrentUser();
          
          if (userData) {
            setUser(userData);
          } else {
            // If no user data but token exists, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Authentication init error:', err);
        setError('Failed to initialize authentication.');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Login method
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(credentials);
      setUser(userData.user);
      return userData.user;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.non_field_errors?.[0] || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Register method
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout method
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  // Forgot password method
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          'Failed to process password reset request.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password method
  const resetPassword = async (token, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          'Failed to reset password.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser((prevUser) => ({ ...prevUser, ...updatedUser }));
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          'Failed to update profile.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear errors
  const clearError = () => {
    setError(null);
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};