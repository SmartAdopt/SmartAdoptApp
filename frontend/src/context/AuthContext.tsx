// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type AuthSession } from "../types/auth.types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthSession | null;
  role: "admin" | "adopter" | "user" | null;
  loginUser: (sessionData: AuthSession) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from localStorage on application load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user session");
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    setIsLoading(false);
  }, []);

  const loginUser = (sessionData: AuthSession) => {
    setUser(sessionData);
    localStorage.setItem("user", JSON.stringify(sessionData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login"; // Force redirect to clear memory
  };

  const value = {
    isAuthenticated: !!user,
    user,
    role: user?.role || null,
    loginUser,
    logoutUser,
  };

  // Prevent rendering children until session is fully checked
  if (isLoading) {
    return null; // Or a MUI <CircularProgress /> centered on screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume the context securely
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};