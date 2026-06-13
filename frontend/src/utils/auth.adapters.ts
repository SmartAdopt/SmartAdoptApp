// src/utils/auth.adapters.ts
import type { LoginApiResponse, AuthSession } from "../types/auth.types";

/**
 * Adapts the raw response from the FastAPI backend into the clean
 * AuthSession object expected by the React frontend Context.
 * Tokens are handled separately by the service/interceptors.
 */
export const adaptLoginResponse = (response: LoginApiResponse): AuthSession => {
  return {
    id: response.id,
    name: `${response.first_name} ${response.last_name}`.trim(),
    email: response.email,
    role: response.role,
  };
};
