// src/pages/adopter/AdopterExplore.tsx

import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  Pets as PetsIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { SwipeablePetCard } from "../../components/molecules/SwipeablePetCard";
import { petsService } from "../../services/pets.service";
import { usePetDatabase } from "../../context/PetContext";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import type { AIProfileResponse } from "../../types/pets.types";

// Number of images to preload ahead of the current card
const IMAGE_LOOKAHEAD = 3;

export const AdopterExplore = () => {
  const navigate = useNavigate();
  const { toggleFavorite, favoritePetIds } = usePetDatabase();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Fetch pets from the real backend API (same endpoint as admin)
  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery<AIProfileResponse[]>({
    queryKey: ["adopterExplorePets"],
    queryFn: petsService.getRawPetsDatabase,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Filter only available pets for the adopter view
  const availablePets = useMemo(
    () => pets.filter((pet) => pet.status?.toLowerCase() !== "adopted"),
    [pets],
  );

  // Extract all image URLs for the batch preloader
  const allImageUrls = useMemo(
    () => availablePets.map((pet) => pet.pet.pet_image_url).filter(Boolean),
    [availablePets],
  );

  // Batch preload images: current + next N cards
  const { isImageReady } = useImagePreloader(
    allImageUrls,
    currentIndex,
    IMAGE_LOOKAHEAD,
  );

  // Handler for "Pass" — advance to the next card
  const handlePass = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  // Handler for "Favorite" — toggle favorite and advance
  const handleFavorite = useCallback(() => {
    const currentPet = availablePets[currentIndex];
    if (currentPet) {
      toggleFavorite(currentPet.id);
    }
    setCurrentIndex((prev) => prev + 1);
  }, [availablePets, currentIndex, toggleFavorite]);

  // Determine the current pet to display
  const currentPet: AIProfileResponse | undefined = availablePets[currentIndex];
  const hasMorePets = currentIndex < availablePets.length;

  return (
    <AdopterLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: "text.secondary", textTransform: "none" }}
      >
        Volver
      </Button>

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Explorar Mascotas
        </Typography>
        <Typography color="text.secondary">
          Descubre a todos los rescataditos que están listos para recibir amor
          en un nuevo hogar.
        </Typography>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={40} color="primary" />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          Hubo un error de conexión al cargar el catálogo de mascotas. Por
          favor, intenta de nuevo.
        </Alert>
      )}

      {/* Tinder Card or Empty State */}
      {!isLoading && !isError && (
        <>
          {hasMorePets && currentPet ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 2,
              }}
            >
              <SwipeablePetCard
                key={currentPet.id}
                profile={currentPet}
                isFavorite={favoritePetIds.includes(currentPet.id)}
                isImagePreloaded={isImageReady(currentPet.pet.pet_image_url)}
                onPass={handlePass}
                onFavorite={handleFavorite}
              />
            </Box>
          ) : (
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
              <PetsIcon sx={{ fontSize: 64, color: "grey.300" }} />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                {availablePets.length === 0
                  ? "No hay mascotas registradas todavía"
                  : "¡Has visto todas las mascotas!"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {availablePets.length === 0
                  ? "Vuelve más tarde, pronto habrá nuevos rescataditos."
                  : "Revisa tus favoritos o vuelve más tarde para ver nuevos perfiles."}
              </Typography>
              {availablePets.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setCurrentIndex(0)}
                  sx={{ mt: 2, borderRadius: 3 }}
                >
                  Volver a explorar
                </Button>
              )}
            </Box>
          )}

          {/* Progress indicator */}
          {hasMorePets && availablePets.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 2 }}
            >
              {currentIndex + 1} / {availablePets.length}
            </Typography>
          )}
        </>
      )}
    </AdopterLayout>
  );
};
