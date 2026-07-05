// src/services/foundation.service.ts
import { apiClient } from "./apiClient";
import { isAxiosError } from "axios";

export interface FoundationBackend {
  foundation_id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  legal_representative: string;
  business_hours: string;
}

export interface LegalInfoFormData {
  legalName: string;
  address: string;
  phone: string;
  email: string;
  legalRepresentative: string;
  businessHours: string;
}

export const foundationService = {
  getFoundation: async (): Promise<LegalInfoFormData | null> => {
    try {
      const { data } = await apiClient.get<FoundationBackend>("/foundation/");

      return {
        legalName: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        legalRepresentative: data.legal_representative,
        businessHours: data.business_hours,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  updateFoundation: async (info: LegalInfoFormData) => {
    const payload: Partial<FoundationBackend> = {
      name: info.legalName,
      address: info.address,
      phone: info.phone,
      email: info.email,
      legal_representative: info.legalRepresentative,
      business_hours: info.businessHours,
    };

    const { data } = await apiClient.put("/foundation/", payload);
    return data;
  },
};
