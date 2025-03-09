import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // If user is not logged in, redirect to login page
  if (!user) {
    // Redirect to login and save the location user was trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in, render children
  return children;
};

export default ProtectedRoute;