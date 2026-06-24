// src/pages/adopter/AdopterFavorites.tsx

import { useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteFilledIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { petsService } from "../../services/pets.service";
import { usePetDatabase } from "../../context/PetContext";
import type { AIProfileResponse } from "../../types/pets.types";

// ==========================================
// FAVORITE PET CARD — Compact card for the grid
// ==========================================
const FavoritePetCard = ({
  profile,
  onToggleFavorite,
}: {
  profile: AIProfileResponse;
  onToggleFavorite: (id: string) => void;
}) => {
  const navigate = useNavigate();

  const petName = profile.pet.name;
  const petAge = profile.pet.age;
  const petBreed =
    profile.pet.animal_breed.length > 1
      ? profile.pet.animal_breed[1]
      : profile.pet.animal_breed[0];
  const petImage = profile.pet.pet_image_url;
  const petGender = profile.pet.gender === "male" ? "Macho" : "Hembra";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <CardMedia
        component="img"
        height="220"
        image={petImage}
        alt={petName}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = "/dog.svg";
        }}
      />

      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {petName}
          </Typography>

          {/* Favorite toggle — always filled since this is the favorites page */}
          <IconButton
            onClick={() => onToggleFavorite(profile.id)}
            color="error"
            size="small"
          >
            <FavoriteFilledIcon />
          </IconButton>
        </Stack>

        <Typography color="text.secondary" gutterBottom>
          {petBreed}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={`${petAge} ${petAge === 1 ? "año" : "años"}`}
            size="small"
          />
          <Chip label={petGender} size="small" />
        </Stack>

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate(`/adopter/pet/${profile.id}`)}
        >
          Ver Perfil
        </Button>
      </CardContent>
    </Card>
  );
};

// ==========================================
// FAVORITES PAGE
// ==========================================
export const AdopterFavorites = () => {
  const { favoritePetIds, toggleFavorite } = usePetDatabase();

  // Fetch from the real backend API (same as admin and explore)
  const {
    data: allPets = [],
    isLoading,
    isError,
  } = useQuery<AIProfileResponse[]>({
    queryKey: ["adopterFavoritePets"],
    queryFn: petsService.getRawPetsDatabase,
    staleTime: 1000 * 60 * 5,
  });

  // Filter only pets whose IDs are in the favoritePetIds array
  const favoritedPets = useMemo(() => {
    return allPets.filter((pet) => favoritePetIds.includes(pet.id));
  }, [allPets, favoritePetIds]);

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
            <Grid container spacing={3}>
              {favoritedPets.map((profile) => (
                <Grid item xs={12} sm={6} lg={4} key={profile.id}>
                  <FavoritePetCard
                    profile={profile}
                    onToggleFavorite={toggleFavorite}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </AdopterLayout>
  );
};
