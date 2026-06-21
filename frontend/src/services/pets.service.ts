// src/services/pets.service.ts

import type { Pet } from "../types/dashboard.types";

export const petsService = {
  /**
   * Fetches all synced pets asynchronously.
   * Ready to be swapped with: const response = await apiClient.get<Pet[]>("/pets");
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
