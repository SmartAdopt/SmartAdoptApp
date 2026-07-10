// src/services/favorites.service.ts

import { apiClient } from "./apiClient";
import type {
  FavoriteAddApiResponse,
  FavoriteListApiResponse,
} from "../types/favorites.types";

export const favoritesService = {
  /**
   * Add a pet to the user's favorites
   */
  addFavorite: async (
    petProfileId: string,
  ): Promise<FavoriteAddApiResponse> => {
    const response = await apiClient.post<FavoriteAddApiResponse>(
      `/adopter/favorites/${petProfileId}`,
    );
    return response.data;
  },

  /**
   * Remove a pet from the user's favorites
   */
  removeFavorite: async (petProfileId: string): Promise<void> => {
    await apiClient.delete(`/adopter/favorites/${petProfileId}`);
  },

  /**
   * List all favorites for the authenticated user, including the pet details.
   */
  listFavoritesWithPets: async (): Promise<FavoriteListApiResponse> => {
    const response = await apiClient.get<FavoriteListApiResponse>(
      "/adopter/favorites/",
    );

    // The backend returns `profile_id`, but the frontend AIProfileResponse expects `id`.
    // We map it here so the React components can read `profile.id` without errors.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedFavorites = response.data.favorites.map((fav: any) => {
      if (fav.pet) {
        fav.pet.id = fav.pet.profile_id ?? fav.pet.id;
      }
      return fav;
    });

    return {
      ...response.data,
      favorites: mappedFavorites,
    };
  },
};
