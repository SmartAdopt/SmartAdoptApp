// src/utils/auth.adapters.ts
import type { AuthSession } from "../types/auth.types";

export const adaptLoginResponse = (response: any): AuthSession => {
  // 1. Extraemos el payload principal
  const payload = response.data ? response.data : response;
  
  // 🚨 Imprimimos el JSON crudo del backend para ver su estructura real
  console.log("📦 PAYLOAD CRUDO DEL BACKEND:", payload);

  // 2. Extraemos el objeto user (puede venir suelto o anidado)
  const userData = payload.user ? payload.user : payload;

  return {
    // Buscamos el token en todas las formas posibles (snake_case, camelCase, etc)
    accessToken: payload.access_token || payload.accessToken || payload.token || "",
    
    user: {
      id: userData.id || userData.user_id || 0,
      firstName: userData.first_name || userData.firstName || "Usuario",
      lastName: userData.last_name || userData.lastName || "",
      email: userData.email || "",
      // Mapeamos el rol (role, type, o requested_role)
      role: userData.role || userData.type || userData.requested_role || "adopter",
      createdAt: userData.created_at || userData.createdAt || new Date().toISOString(),
    },
  };
};