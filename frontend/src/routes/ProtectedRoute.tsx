// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type Role } from "../types/auth.types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // FIX: Previene la condición de carrera (Race Condition) del Router.
  // Si el estado de React aún no se actualiza, verificamos la fuente absoluta.
  const localToken = localStorage.getItem("access_token");
  const isReallyAuthenticated = isAuthenticated || !!localToken;

  // Si no hay sesión ni en el estado ni en el storage, expulsamos al login
  if (!isReallyAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta exige roles específicos, verificamos
  if (allowedRoles) {
    // Fallback: Si el context "user" aún es null por el delay de React, lo leemos del storage
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    const userRole = currentUser.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      // Si un adopter intenta entrar al dashboard de admin, lo enviamos al inicio
      return <Navigate to="/" replace />;
    }
  }

  // Si todo está correcto, renderizamos la vista protegida
  return <Outlet />;
};