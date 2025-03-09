import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const AuthLayout = () => {
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('mockAuthToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // If not authenticated, render the login/register pages
  return <Outlet />;
};

export default AuthLayout;