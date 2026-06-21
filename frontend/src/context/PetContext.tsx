// src/context/PetContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Pet } from "../types/dashboard.types";
import { dashboardService } from "../services/dashboard.service";

interface PetContextType {
  pets: Pet[];
  addPet: (newPet: Omit<Pet, "id">) => Pet;
  // --- NEW: Favorites Management ---
  favoritePetIds: string[];
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

  React.useEffect(() => {
    const loadInitialPets = async () => {
      try {
        const initialData = await dashboardService.getFeaturedPets();
        setPets(initialData);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to load initial mock pets data", error);
      }
    };

    if (!isInitialized) {
      loadInitialPets();
    }
  }, [isInitialized]);

  const addPet = (newPet: Omit<Pet, "id">): Pet => {
    const createdEntity: Pet = {
      ...newPet,
      id: `pet-${Date.now()}`,
    };
    setPets((prevPets) => [createdEntity, ...prevPets]);
    return createdEntity;
  };

  // Toggles a pet ID inside the favorites array
  const toggleFavorite = (petId: string) => {
    setFavoritePetIds(
      (prev) =>
        prev.includes(petId)
          ? prev.filter((id) => id !== petId) // Remove if it exists
          : [...prev, petId], // Add if it doesn't exist
    );
  };

  return (
    <PetContext.Provider
      value={{ pets, addPet, favoritePetIds, toggleFavorite }}
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
