import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'ADMIN' | 'DRIVER';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    // Redirect to their respective dashboard if they try to access wrong route
    return <Navigate to={currentUser.role === 'ADMIN' ? '/admin-dashboard' : '/driver-dashboard'} replace />;
  }

  return <>{children}</>;
};
