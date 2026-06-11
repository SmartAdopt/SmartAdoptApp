import { useState, type ReactNode } from "react";

import { AuthContext } from "./AuthContext";

import type { AuthUser, AuthSession } from "../types/auth.types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });

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

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    localStorage.removeItem("refresh_token");
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
