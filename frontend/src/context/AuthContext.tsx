// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { type User, type LoginResponse } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (data: LoginResponse) => {
    setUser(data.user);
    setToken(data.access_token);
    // In a real scenario, you would also save the token to localStorage/sessionStorage here
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear localStorage/sessionStorage here
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};