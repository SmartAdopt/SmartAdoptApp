// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { type AuthSession } from "../types/auth.types";
import { logger } from "../utils/logger";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthSession | null;
  role: "admin" | "adopter" | "user" | null;
  loginUser: (sessionData: AuthSession) => void;
  logoutUser: () => void;
}

// Tell Vite's Fast Refresh to ignore the non-component export warning here
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Lazy initialization: React only reads localStorage once during the initial render.
  // This completely eliminates the need for an expensive useEffect and prevents cascading renders.
  const [user, setUser] = useState<AuthSession | null>(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // Removed the unused 'error' variable to satisfy the linter
        logger.error("Failed to parse user session");
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    return null; // Initial state if nothing is stored or if parsing fails
  });

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

  // Since lazy initialization is synchronous, we no longer need an 'isLoading' block.
  // The layout renders instantly without flickering.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume the context securely
// Tell Vite's Fast Refresh to ignore the non-component export warning here too
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
