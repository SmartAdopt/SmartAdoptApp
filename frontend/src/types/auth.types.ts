// src/types/auth.types.ts

// Allow two roles
export type Role = "adopter" | "admin";

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  role: Role;
  firebase_uid?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password?: string; // Optional if using Google Flow
  requested_role: Role;
}
