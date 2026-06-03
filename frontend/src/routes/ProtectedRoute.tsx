// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type Role } from '../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // If the user is not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires a specific role and the user doesn't have it
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect public users trying to access admin routes to home
    return <Navigate to="/" replace />;
  }

  // If everything is fine, render the child routes
  return <Outlet />;
};