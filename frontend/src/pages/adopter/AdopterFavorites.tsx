// src/pages/adopter/AdopterFavorites.tsx

import { useMemo } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { FavoriteBorder as FavoriteBorderIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { PetGrid } from "../../components/organisms/PetGrid";
import { petsService } from "../../services/pets.service";
import { usePetDatabase } from "../../context/PetContext";
import type { Pet } from "../../types/dashboard.types";

export const AdopterFavorites = () => {
  const { pets: contextPets, favoritePetIds } = usePetDatabase();

  // Fetch the catalog via TanStack Query
  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery<Pet[]>({
    queryKey: ["allPets", contextPets],
    queryFn: () => petsService.getAllPets(contextPets),
    staleTime: 1000 * 60 * 5,
  });

  // Filter ONLY pets whose IDs are in the favoritePetIds array
  const favoritedPets = useMemo(() => {
    return pets.filter((pet: Pet) => favoritePetIds.includes(pet.id));
  }, [pets, favoritePetIds]);

  return (
    <AdopterLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Mis Favoritos
        </Typography>
        <Typography color="text.secondary">
          Aquí están los rescataditos que te robaron el corazón.
        </Typography>
      </Box>

      {/* Loading & Error States */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={40} color="primary" />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          Hubo un error al cargar tus favoritos.
        </Alert>
      )}

      {/* Render logic */}
      {!isLoading && !isError && (
        <>
          {favoritedPets.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 64, color: "grey.300" }} />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                Aún no tienes favoritos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explora el catálogo y marca con un corazón a las mascotas que te
                interesen.
              </Typography>
            </Box>
          ) : (
            <PetGrid pets={favoritedPets} />
          )}
        </>
      )}
    </AdopterLayout>
  );
};
