// src/services/auth.service.ts

import axios from "axios";
import { apiClient } from "./apiClient";
import type {
  LoginApiRequest,
  LoginApiResponse,
  RegisterApiRequest,
  RegisterApiResponse,
  AuthSession,
  ApiErrorResponse,
} from "../types/auth.types";
import { adaptLoginResponse } from "../utils/auth.adapters";

export const authService = {
  login: async (credentials: LoginApiRequest): Promise<AuthSession> => {
    try {
      const response = await apiClient.post<LoginApiResponse>(
        "/auth/login",
        credentials,
      );

      // Save both tokens in LocalStorage
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }

      return adaptLoginResponse(response.data);
    } catch (error) {
      throw authService.handleApiError(error, "Invalid credentials");
    }
  },

  register: async (
    userData: RegisterApiRequest,
  ): Promise<RegisterApiResponse> => {
    try {
      const response = await apiClient.post<RegisterApiResponse>(
        "/auth/register",
        userData,
      );
      return response.data;
    } catch (error) {
      throw authService.handleApiError(error, "Registration failed");
    }
  },

  /**
   * Centralizes error handling for the auth service.
   * Extracts the specific error message provided by the FastAPI backend.
   */
  handleApiError: (error: unknown, defaultMessage: string): Error => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as import("axios").AxiosError<ApiErrorResponse>;

      // Extract the detail message from the FastAPI response structure if it exists
      if (axiosError.response?.data?.detail?.message) {
        return new Error(axiosError.response.data.detail.message);
      }
    }
    return new Error(defaultMessage);
  },
};
