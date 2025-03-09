import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '../AuthContext';
import { authService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // Test Component to consume the context
  const TestComponent = () => {
    const auth = React.useContext(AuthContext);
    
    return (
      <div>
        <div data-testid="loading">{auth.loading.toString()}</div>
        <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
        <div data-testid="error">{auth.error || 'no-error'}</div>
        {auth.user && <div data-testid="username">{auth.user.username}</div>}
        
        <button onClick={() => auth.login({ username: 'testuser', password: 'password' })}>
          Login
        </button>
        
        <button onClick={() => auth.logout()}>
          Logout
        </button>
        
        <button onClick={() => auth.clearError()}>
          Clear Error
        </button>
      </div>
    );
  };

  test('initializes with loading state and checks localStorage', async () => {
    // Mock localStorage and getCurrentUser
    localStorageMock.getItem.mockReturnValueOnce('test-token');
    authService.getCurrentUser.mockReturnValueOnce({ username: 'testuser', id: '1' });
    
    // Render the component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially loading should be true
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check auth state after initialization
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('username').textContent).toBe('testuser');
    
    // Verify localStorage and getCurrentUser were called
    expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  test('handles login success', async () => {
    // Mock successful login
    const mockUser = { username: 'testuser', id: '1' };
    authService.login.mockResolvedValueOnce({ user: mockUser });
    
    // Render the component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check initial auth state
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    
    // Trigger login
    userEvent.click(screen.getByText('Login'));
    
    // Should be loading while login is in progress
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check auth state after login
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('username').textContent).toBe('testuser');
    expect(screen.getByTestId('error').textContent).toBe('no-error');
    
    // Verify login was called with correct credentials
    expect(authService.login).toHaveBeenCalledWith({ 
      username: 'testuser', 
      password: 'password' 
    });
  });

  test('handles login failure', async () => {
    // Mock failed login
    const errorMessage = 'Invalid credentials';
    const error = new Error(errorMessage);
    error.response = { data: { detail: errorMessage } };
    authService.login.mockRejectedValueOnce(error);
    
    // Render the component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Trigger login
    userEvent.click(screen.getByText('Login'));
    
    // Wait for login attempt to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check auth state after failed login
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    expect(screen.getByTestId('error').textContent).toBe(errorMessage);
  });

  test('handles logout', async () => {
    // Setup authenticated state
    const mockUser = { username: 'testuser', id: '1' };
    authService.getCurrentUser.mockReturnValueOnce(mockUser);
    localStorageMock.getItem.mockReturnValueOnce('test-token');
    
    // Render the component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    // Trigger logout
    userEvent.click(screen.getByText('Logout'));
    
    // Check auth state after logout
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    
    // Verify logout was called
    expect(authService.logout).toHaveBeenCalled();
  });

  test('clears error when clearError is called', async () => {
    // Mock failed login to set an error
    const errorMessage = 'Invalid credentials';
    const error = new Error(errorMessage);
    error.response = { data: { detail: errorMessage } };
    authService.login.mockRejectedValueOnce(error);
    
    // Render the component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Trigger login (which will fail)
    userEvent.click(screen.getByText('Login'));
    
    // Wait for login attempt to complete
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe(errorMessage);
    });
    
    // Now clear the error
    userEvent.click(screen.getByText('Clear Error'));
    
    // Check that the error was cleared
    expect(screen.getByTestId('error').textContent).toBe('no-error');
  });
});