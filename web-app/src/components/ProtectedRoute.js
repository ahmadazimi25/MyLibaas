import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { 
      isAuthenticated: !!user, 
      loading,
      path: location.pathname
    });
  }, [user, loading, location]);

  if (loading) {
    // You might want to show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
