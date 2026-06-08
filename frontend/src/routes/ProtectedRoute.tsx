// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { type Role } from "../types/auth.types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // FIX: Prevent the Router race condition.
  // If React state has not updated yet, verify the source of truth.
  const localToken = localStorage.getItem("access_token");
  const isReallyAuthenticated = isAuthenticated || !!localToken;

  // If there is no session in state or storage, redirect to login
  if (!isReallyAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires specific roles, validate them
  if (allowedRoles) {
    // Fallback: If the context "user" is still null due to React delay, read it from storage
    const currentUser =
      user || JSON.parse(localStorage.getItem("user") || "null");

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    const userRole = currentUser.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toLowerCase(),
    );

    if (!normalizedAllowedRoles.includes(userRole)) {
      // If an adopter tries to access the admin dashboard, send them to the home page
      return <Navigate to="/" replace />;
    }
  }

  // If everything is correct, render the protected view
  return <Outlet />;
};
