import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, userProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.emailVerified) {
    // Redirect to login but save the attempted path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && (!userProfile || userProfile.role !== requiredRole)) {
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
