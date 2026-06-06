// src/types/auth.types.ts

// ---------------------------------------------------------
// Shared Types
// ---------------------------------------------------------
export type Role = "adopter" | "admin";

// ---------------------------------------------------------
// 1. API CONTRACTS (Strictly what the SA-37 backend dictates)
// We use snake_case because FastAPI and Pydantic process it that way.
// ---------------------------------------------------------

export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  access_token: string;
  message: string;
  id: number;
  first_name: string;
  last_name?: string; // Optional because the Admin may not have it according to the contract
  email: string;
  role: Role;
  created_at?: string;
}

export interface RegisterApiRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string; // Required according to the contract's standard flow
  requested_role: Role;
}

export interface RegisterApiResponse {
  message: string;
  user_id: number;
  created_at?: string;
}

// Standard error structure defined in the SA-37 document
export interface ApiErrorResponse {
  detail: {
    message: string;
  };
}

// ---------------------------------------------------------
// 2. FRONTEND INTERNAL MODELS (Our clean models)
// We use camelCase for our React components (Organisms/Pages).
// ---------------------------------------------------------

export interface AuthUser {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser; // Here we do nest the user to keep the global state organized
}
