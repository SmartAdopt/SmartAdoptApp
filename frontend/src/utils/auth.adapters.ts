// src/utils/auth.adapters.ts
import type { AuthSession } from "../types/auth.types";

type LoginResponsePayload = {
  data?: unknown;
  access_token?: unknown;
  accessToken?: unknown;
  token?: unknown;
  user?: Record<string, unknown>;
  id?: unknown;
  user_id?: unknown;
  first_name?: unknown;
  firstName?: unknown;
  last_name?: unknown;
  lastName?: unknown;
  email?: unknown;
  role?: unknown;
  type?: unknown;
  requested_role?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asString = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
  return typeof value === "number" ? value : fallback;
};

export const adaptLoginResponse = (response: LoginResponsePayload): AuthSession => {
  // 1. Extract the main payload
  const payload = isRecord(response.data) ? response.data : response;
  
  // 🚨 Log the raw backend JSON to inspect its actual structure
  console.log("📦 RAW BACKEND PAYLOAD:", payload);

  // 2. Extract the user object (it may come standalone or nested)
  const userData = isRecord(payload.user) ? payload.user : payload;

  return {
    // Look for the token in all possible forms (snake_case, camelCase, etc)
    accessToken:
      asString(payload.access_token) ||
      asString(payload.accessToken) ||
      asString(payload.token),
    
    user: {
      id: asNumber(userData.id) || asNumber(userData.user_id),
      firstName: asString(userData.first_name) || asString(userData.firstName) || "Usuario",
      lastName: asString(userData.last_name) || asString(userData.lastName),
      email: asString(userData.email),
      // Map the role (role, type, or requested_role)
      role: asString(userData.role) || asString(userData.type) || asString(userData.requested_role) || "adopter",
      createdAt: asString(userData.created_at) || asString(userData.createdAt) || new Date().toISOString(),
    },
  };
};