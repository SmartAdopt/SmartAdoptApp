// src/components/organisms/FeaturedPetsSection.tsx

import {
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { petsService } from "../../services/pets.service";
import { PetCard } from "../molecules/PetCard";
import type { AIProfileResponse } from "../../types/pets.types";

export const FeaturedPetsSection = () => {
  const navigate = useNavigate();

  // Fetch pets from the real backend API
  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery<AIProfileResponse[]>({
    queryKey: ["featuredPets"],
    queryFn: petsService.getRawPetsDatabase,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Filter available pets, sort by creation_date (newest first), and take the top 3
  const latestPets = [...pets]
    .filter((pet) => pet.status?.toLowerCase() !== "adopted")
    .sort((a, b) => {
      const dateA = new Date(a.creation_date || 0).getTime();
      const dateB = new Date(b.creation_date || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Grid item xs={6}>
          <Typography variant="h6" fontWeight={700}>
            Mascotas Destacadas
          </Typography>
        </Grid>

        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Button onClick={() => navigate("/adopter/explore")}>
            Ver Todas
          </Button>
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Hubo un error al cargar las mascotas destacadas.
        </Alert>
      )}

      {!isLoading && !isError && (
        <Grid container spacing={3}>
          {latestPets.map((profile) => {
            const petName = profile.pet.name;
            const petAge = profile.pet.age;
            const petBreed =
              profile.pet.animal_breed.length > 1
                ? profile.pet.animal_breed[1]
                : profile.pet.animal_breed[0];
            const petImage = profile.pet.pet_image_url;
            const petGender =
              profile.pet.gender === "male" ? "Macho" : "Hembra";

            return (
              <Grid item xs={12} md={6} lg={4} key={profile.id}>
                <PetCard
                  id={profile.id}
                  nombre={petName}
                  raza={petBreed}
                  edad={`${petAge} ${petAge === 1 ? "año" : "años"}`}
                  genero={petGender}
                  ubicacion={"Centro SmartAdopt"}
                  imagen={petImage}
                />
              </Grid>
            );
          })}

          {latestPets.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center">
                No hay mascotas registradas aún.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Paper>
  );
};
