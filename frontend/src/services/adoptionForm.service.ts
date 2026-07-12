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

export interface AdminFormResponse {
  forms: AdminFormItem[];
  applications_count: number;
}

export interface AdminFormItem {
  form_id: string;
  user_id: number;
  neighborhood: string;
  address: string;
  employment_status: string;
  housing_type: string;
  has_natural_space: boolean;
  has_pets: boolean;
  household_energy: string;
  has_children: boolean;
  long_term_commitment: boolean;
  preferred_species: string;
  preferred_gender: string;
  preferred_energy: string;
  daily_time_dedication: string;
  sleeping_location: string;
  behavior_approach: string;
  emergency_plan: string;
  motivation: string;
  submission_date: string;
  last_updated: string;
  applications: AdminApplicationItem[];
}

export interface AdminApplicationItem {
  application_id: string;
  pet_profile_id: string;
  pet_name?: string;
  adopter_name?: string;
  total_score: number;
  total_max_score: number;
  main_score: number;
  main_max_score: number;
  logistics_education_score: number;
  logistics_education_max_score: number;
  ai_breakdown?: AdminBreakdownItem[];
  ai_justification?: string;
  status: string;
  created_at: string;
  needs_manual_review: boolean;
  reviewed_by?: number;
  reviewed_at?: string;
}

export interface AdminBreakdownItem {
  section: string;
  field: string;
  label: string;
  answer: string;
  evaluation: string;
  points: number;
  max_points: number;
}

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
    data: BackendAdoptionFormRequest
  ): Promise<AdoptionFormSubmitResponse> => {
    try {
      const response = await apiClient.post<AdoptionFormSubmitResponse>(
        "/adoption-forms/submit",
        data
      );
      return response.data;
    } catch (error) {
      throw adoptionFormService.handleApiError(
        error,
        "Error al enviar el formulario de adopción"
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
      const response = await apiClient.get<AdoptionFormGetResponse>(
        "/adoption-forms/me"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw adoptionFormService.handleApiError(
        error,
        "Error al obtener el formulario de adopción"
      );
    }
  },

  /**
   * Update the current user's adoption form.
   * PUT /adoption-forms/me
   */
  updateMyForm: async (
    data: BackendAdoptionFormUpdateRequest
  ): Promise<AdoptionFormUpdateResponse> => {
    try {
      const response = await apiClient.put<AdoptionFormUpdateResponse>(
        "/adoption-forms/me",
        data
      );
      return response.data;
    } catch (error) {
      throw adoptionFormService.handleApiError(
        error,
        "Error al actualizar el formulario de adopción"
      );
    }
  },

  /**
   * Admin: Get all adoption forms with optional status and pet name filters.
   * GET /adoption-forms/admin?status=&pet_name=
   */
  getAdminForms: async (
    statusFilter?: string,
    petName?: string
  ): Promise<AdminFormResponse> => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (petName) params.set("pet_name", petName);
    const qs = params.toString();
    try {
      const response = await apiClient.get<AdminFormResponse>(
        `/adoption-forms/admin${qs ? `?${qs}` : ""}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { forms: [], applications_count: 0 };
      }
      throw error;
    }
  },

  /**
   * Admin: Review (approve/reject) an adoption application.
   * PUT /adoption-forms/{application_id}/review
   */
  reviewApplication: async (
    applicationId: string,
    status: "approved" | "rejected"
  ): Promise<void> => {
    await apiClient.put(`/adoption-forms/${applicationId}/review`, { status });
  },

  /**
   * Admin: Get dashboard statistics.
   * GET /admin/dashboard
   */
  getDashboardStats: async (): Promise<{
    total_pets: number;
    available_pets: number;
    in_process_pets: number;
    adopted_pets: number;
    total_applications: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
  }> => {
    const response = await apiClient.get("/admin/dashboard");
    return response.data.dashboard_data;
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

export const translateAnswer = (answer: string): string => {
  const translations: Record<string, string> = {
    "yes": "Sí",
    "no": "No",
    "house": "Casa",
    "apartment": "Departamento",
    "farm": "Finca/Granja",
    "employed": "Empleado",
    "unemployed": "Desempleado",
    "student": "Estudiante",
    "retired": "Jubilado",
    "calm": "Calmada",
    "active": "Activa",
    "very_active": "Muy activa",
    "positive_reinforcement": "Refuerzo positivo",
    "professional_trainer": "Entrenador profesional",
    "self_taught": "Autodidacta",
    "dog": "Perro",
    "cat": "Gato",
    "no_preference": "Sin preferencia",
    "male": "Macho",
    "female": "Hembra",
    "inside": "Adentro",
    "outside": "Afuera",
    "both": "Ambos"
  };
  return translations[answer?.toLowerCase()] || answer;
};

export const translateBreakdownItem = (item: AdminBreakdownItem): AdminBreakdownItem => {
  const fieldTranslations: Record<string, string> = {
    "neighborhood": "Barrio",
    "address": "Dirección",
    "employment_status": "Estado laboral",
    "housing_type": "Tipo de vivienda",
    "has_natural_space": "Tiene espacio natural",
    "has_pets": "Tiene mascotas",
    "household_energy": "Energía del hogar",
    "has_children": "Tiene niños",
    "long_term_commitment": "Compromiso a largo plazo",
    "preferred_species": "Especie preferida",
    "preferred_gender": "Género preferido",
    "preferred_energy": "Energía preferida",
    "daily_time_dedication": "Dedicación diaria (horas)",
    "sleeping_location": "Lugar para dormir",
    "behavior_approach": "Enfoque de comportamiento",
    "emergency_plan": "Plan de emergencia",
    "motivation": "Motivación"
  };

  return {
    ...item,
    label: fieldTranslations[item.field] || item.label,
    answer: translateAnswer(item.answer)
  };
};
