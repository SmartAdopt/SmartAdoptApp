// src/types/favorites.types.ts

import type { AIProfileResponse } from "./pets.types";

export interface FavoriteApiResponse {
  favorite_id: number;
  user_id: number;
  pet_profile_id: string;
}

export interface FavoriteWithPetApiResponse extends FavoriteApiResponse {
  pet?: AIProfileResponse;
}

export interface FavoriteListApiResponse {
  favorites: FavoriteWithPetApiResponse[];
  count: number;
}

export interface FavoriteAddApiResponse {
  message: string;
  favorite: FavoriteApiResponse;
}
