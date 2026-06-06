// src/utils/auth.adapters.ts
import type { AuthSession } from "../types/auth.types";

export const adaptLoginResponse = (response: any): AuthSession => {
  // 1. Extract the main payload
  const payload = response.data ? response.data : response;
  
  // 🚨 Log the raw backend JSON to inspect its actual structure
  console.log("📦 RAW BACKEND PAYLOAD:", payload);

  // 2. Extract the user object (it may come standalone or nested)
  const userData = payload.user ? payload.user : payload;

  return {
    // Look for the token in all possible forms (snake_case, camelCase, etc)
    accessToken: payload.access_token || payload.accessToken || payload.token || "",
    
    user: {
      id: userData.id || userData.user_id || 0,
      firstName: userData.first_name || userData.firstName || "Usuario",
      lastName: userData.last_name || userData.lastName || "",
      email: userData.email || "",
      // Map the role (role, type, or requested_role)
      role: userData.role || userData.type || userData.requested_role || "adopter",
      createdAt: userData.created_at || userData.createdAt || new Date().toISOString(),
    },
  };
};