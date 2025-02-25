import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}

type ChildrenType = 
  | React.ReactNode
  | ((props: { user: User }) => React.ReactElement);

interface ProtectedRouteProps {
  children: ChildrenType;
  allowedRoles?: ('admin' | 'student')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in the allowed roles, redirect to dashboard
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ message: "You don't have permission to access this page" }} replace />;
  }

  // Handle function as children
  if (typeof children === 'function' && user) {
    return <>{children({ user })}</>;
  }
  
  // Handle regular ReactNode children
  return <>{children}</>;
}
