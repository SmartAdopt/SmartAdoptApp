// src/routes/guards/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: Array<"admin" | "adopter" | "user">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  // 1. Check if the user is logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user has the required role
  if (role && !allowedRoles.includes(role)) {
    // Redirect based on their actual role to prevent them from seeing a blank screen
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "adopter") {
      return <Navigate to="/adopter/home" replace />;
    }
    // Fallback for unexpected cases
    return <Navigate to="/login" replace />;
  }

  // 3. If everything is correct, render the child routes
  return <Outlet />;
};