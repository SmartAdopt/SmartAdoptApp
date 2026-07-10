// src/context/PetContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Pet } from "../types/dashboard.types";
import { dashboardService } from "../services/dashboard.service";
import { favoritesService } from "../services/favorites.service";
import { useAuth } from "./AuthContext";
import { logger } from "../utils/logger";
import { useQueryClient } from "@tanstack/react-query";

interface PetContextType {
  pets: Pet[];
  addPet: (newPet: Omit<Pet, "id">) => Pet;
  // --- Favorites Management ---
  favoritePetIds: string[];
  isFavoritesLoaded: boolean;
  toggleFavorite: (petId: string) => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Array of string IDs representing favorited pets
  const [favoritePetIds, setFavoritePetIds] = useState<string[]>([]);
  const [isFavoritesLoaded, setIsFavoritesLoaded] = useState<boolean>(false);

  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    const loadInitialPets = async () => {
      try {
        const initialData = await dashboardService.getFeaturedPets();
        setPets(initialData);
        setIsInitialized(true);
      } catch (error) {
        logger.error("Failed to load initial mock pets data", error);
      }
    };

    if (!isInitialized) {
      loadInitialPets();
    }
  }, [isInitialized]);

  const queryClient = useQueryClient();

  // Load favorites from the backend on mount or login
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated || role !== "adopter") {
        setFavoritePetIds([]);
        setIsFavoritesLoaded(true);
        return;
      }

      try {
        const response = await favoritesService.listFavoritesWithPets();
        const ids = response.favorites.map((fav) => fav.pet_profile_id);
        setFavoritePetIds(ids);
      } catch (error) {
        logger.error("Failed to load favorites", error);
      } finally {
        setIsFavoritesLoaded(true);
      }
    };

    loadFavorites();
  }, [isAuthenticated, role]);

  const addPet = (newPet: Omit<Pet, "id">): Pet => {
    const createdEntity: Pet = {
      ...newPet,
      id: `pet-${Date.now()}`,
    };
    setPets((prevPets) => [createdEntity, ...prevPets]);
    return createdEntity;
  };

  // Optimistic toggle with backend sync
  const toggleFavorite = async (petId: string) => {
    if (!isAuthenticated || role !== "adopter") {
      logger.warn("Must be logged in as an adopter to favorite pets");
      return;
    }

    const isCurrentlyFavorited = favoritePetIds.includes(petId);

    // 1. Optimistic UI update
    setFavoritePetIds(
      (prev) =>
        isCurrentlyFavorited
          ? prev.filter((id) => id !== petId) // Remove
          : [...prev, petId], // Add
    );

    // 2. Backend synchronization
    try {
      if (isCurrentlyFavorited) {
        await favoritesService.removeFavorite(petId);
      } else {
        await favoritesService.addFavorite(petId);
      }

      // Invalidate the cache so AdopterFavorites.tsx fetches the updated list
      queryClient.invalidateQueries({ queryKey: ["adopterFavoritesList"] });
    } catch (error) {
      logger.error("Failed to sync favorite with backend, rolling back", error);
      // 3. Rollback on failure
      setFavoritePetIds(
        (prev) =>
          isCurrentlyFavorited
            ? [...prev, petId] // Add back
            : prev.filter((id) => id !== petId), // Remove again
      );
    }
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        addPet,
        favoritePetIds,
        isFavoritesLoaded,
        toggleFavorite,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePetDatabase = (): PetContextType => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePetDatabase must be used within a PetProvider");
  }
  return context;
};
