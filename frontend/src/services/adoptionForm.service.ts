// src/services/adoptionForm.service.ts

import axios from "axios";
import { apiClient } from "./apiClient";
import type {
  BackendAdoptionFormRequest,
  AdoptionFormSubmitResponse,
  AdoptionFormGetResponse,
  BackendAdoptionFormUpdateRequest,
  AdoptionFormUpdateResponse,
} from "../types/suitability.types";

/**
 * Service layer for the Adoption Form API.
 * All endpoints require JWT authentication with adopter role.
 * The apiClient interceptor automatically attaches the Bearer token.
 */
export const adoptionFormService = {
  /**
   * Submit a new adoption form.
   * POST /adoption-forms/submit
   */
  submitForm: async (
    data: BackendAdoptionFormRequest,
  ): Promise<AdoptionFormSubmitResponse> => {
    try {
      const response = await apiClient.post<AdoptionFormSubmitResponse>(
        "/adoption-forms/submit",
        data,
      );
      return response.data;
    } catch (error) {
      throw adoptionFormService.handleApiError(
        error,
        "Error al enviar el formulario de adopción",
      );
    }
  },

  /**
   * Get the current user's adoption form.
   * GET /adoption-forms/me
   * Returns null if no form exists (404).
   */
  getMyForm: async (): Promise<AdoptionFormGetResponse | null> => {
    try {
      const response =
        await apiClient.get<AdoptionFormGetResponse>("/adoption-forms/me");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw adoptionFormService.handleApiError(
        error,
        "Error al obtener el formulario de adopción",
      );
    }
  },

  /**
   * Update the current user's adoption form.
   * PUT /adoption-forms/me
   */
  updateMyForm: async (
    data: BackendAdoptionFormUpdateRequest,
  ): Promise<AdoptionFormUpdateResponse> => {
    try {
      const response = await apiClient.put<AdoptionFormUpdateResponse>(
        "/adoption-forms/me",
        data,
      );
      return response.data;
    } catch (error) {
      throw adoptionFormService.handleApiError(
        error,
        "Error al actualizar el formulario de adopción",
      );
    }
  },

  /**
   * Centralized error handling for the adoption form service.
   * Extracts the specific error message from the FastAPI response.
   */
  handleApiError: (error: unknown, defaultMessage: string): Error => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as import("axios").AxiosError<{
        detail?: { message?: string };
      }>;
      if (axiosError.response?.data?.detail?.message) {
        return new Error(axiosError.response.data.detail.message);
      }
    }
    return new Error(defaultMessage);
  },
};
