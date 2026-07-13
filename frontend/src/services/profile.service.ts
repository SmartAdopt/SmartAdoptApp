// src/services/profile.service.ts

import axios from "axios";
import { apiClient } from "./apiClient";
import type {
  UpdateProfileApiRequest,
  UpdateProfileApiResponse,
  ApiErrorResponse,
} from "../types/auth.types";

export const profileService = {
  /**
   * Updates the adopter profile via PUT /adopter/profile.
   * All fields are optional — only provided fields will be updated.
   * The JWT Bearer token is attached automatically by the apiClient interceptor.
   */
  updateProfile: async (
    data: UpdateProfileApiRequest
  ): Promise<UpdateProfileApiResponse> => {
    try {
      const response = await apiClient.put<UpdateProfileApiResponse>(
        "/adopter/profile",
        data
      );
      return response.data;
    } catch (error) {
      throw profileService.handleApiError(error, "Failed to update profile");
    }
  },

  /**
   * Changes the adopter password via the same PUT /adopter/profile endpoint.
   * Requires both current_password and new_password.
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<UpdateProfileApiResponse> => {
    try {
      const response = await apiClient.put<UpdateProfileApiResponse>(
        "/adopter/profile",
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw profileService.handleApiError(error, "Failed to change password");
    }
  },

  /**
   * Centralizes error handling for the profile service.
   * Extracts the specific error message provided by the FastAPI backend.
   */
  handleApiError: (error: unknown, defaultMessage: string): Error => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as import("axios").AxiosError<ApiErrorResponse>;

      // Extract the detail message from the FastAPI response structure
      if (axiosError.response?.data?.detail?.message) {
        return new Error(axiosError.response.data.detail.message);
      }
    }
    return new Error(defaultMessage);
  },
};
