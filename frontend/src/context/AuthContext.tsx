// src/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type {
  AuthUser,
  AuthSession,
} from "../types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to consume the authentication context.
 * Ensures it is always used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Initialize the user from localStorage
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Initialize the token from localStorage
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });

  // Save the session in state and localStorage
  const login = (session: AuthSession) => {
    console.log("--- SESIÓN RECIBIDA EN CONTEXTO ---");
    console.log("Datos de sesión:", session);
    console.log("Usuario:", session.user);
    console.log("Rol detectado:", session.user?.role);

    setUser(session.user);
    setToken(session.accessToken);

    localStorage.setItem("access_token", session.accessToken);
    localStorage.setItem("user", JSON.stringify(session.user));
  };

  // Remove the session from state and localStorage
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};