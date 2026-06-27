// src/services/pets.service.ts

import { apiClient } from "./apiClient";
import type {
  PetRegistrationRequest,
  PetRegistrationResponse,
  AIProfileResponse,
} from "../types/pets.types";
import type { Pet } from "../types/dashboard.types";

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const petsService = {
  /**
   * STEP 1: Upload the physical image to Backblaze B2
   * Endpoint: POST /backblaze/upload
   */
  uploadPetImage: async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    // NOTE: The backend expects the variable to be named "file" according to backblaze_routes.py
    formData.append("file", imageFile);

    // CRITICAL FIX: We bypass apiClient to prevent its default "application/json"
    // from stripping the browser's multipart/form-data boundary generation.
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${API_BASE_URL}/backblaze/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Returns the public URL from the Backblaze bucket
    return response.data.image_url;
  },

  /**
   * STEP 2: Register the pet and trigger the Llama 3 AI generation
   * Endpoint: POST /pets/register
   */
  registerPet: async (
    payload: PetRegistrationRequest,
  ): Promise<PetRegistrationResponse> => {
    const response = await apiClient.post<PetRegistrationResponse>(
      "/pets/register",
      payload,
    );
    return response.data;
  },

  /**
   * EXTRA WINDOW: Fetch all raw profiles from the backend
   * Endpoint: GET /pets/
   */
  getRawPetsDatabase: async (): Promise<AIProfileResponse[]> => {
    const response = await apiClient.get("/pets/");
    // The backend returns "profile_id" but our frontend type uses "id"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.pets.map((pet: any) => ({
      ...pet,
      id: pet.profile_id ?? pet.id,
    }));
  },

  /**
   * LEGACY MOCK METHODS
   * Restored to fix compilation errors in AdopterExplore and PetProfilePage
   */
  getAllPets: async (databaseContextPets: Pet[]): Promise<Pet[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(databaseContextPets);
      }, 700); // 700ms simulation latency for TanStack Query loaders
    });
  },

  getPetById: async (id: string, contextDatabase: Pet[]): Promise<Pet> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundPet = contextDatabase.find((p) => p.id === id);
        if (foundPet) {
          resolve(foundPet);
        } else {
          reject(new Error("Pet not found in database"));
        }
      }, 600); // Simulated network latency
    });
  },
};
