import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

// Mock the Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  useLocation: jest.fn(() => ({ pathname: '/protected-route' }))
}));

describe('ProtectedRoute Component', () => {
  // Test loading state
  test('renders loading spinner when loading is true', () => {
    const authContextValue = {
      user: null,
      loading: true
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Check for CircularProgress
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // Test authenticated state
  test('renders children when user is authenticated', () => {
    const authContextValue = {
      user: { id: '1', username: 'testuser' },
      loading: false
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Check that protected content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  // Test unauthenticated state
  test('redirects to login when user is not authenticated', () => {
    const authContextValue = {
      user: null,
      loading: false
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Check for redirection
    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement.getAttribute('data-to')).toBe('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});