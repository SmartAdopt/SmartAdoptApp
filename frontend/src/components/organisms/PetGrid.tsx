// src/components/organisms/PetGrid.tsx

import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { Pets as PetsIcon } from "@mui/icons-material";
import { PetCard } from "../molecules/PetCard";
import type { Pet } from "../../types/dashboard.types"; // Ensure this matches your directory structure

interface PetGridProps {
  pets: Pet[];
}

export const PetGrid: React.FC<PetGridProps> = ({ pets }) => {
  // Render empty state if no pets match the search criteria
  if (pets.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <PetsIcon sx={{ fontSize: 64, color: "grey.300" }} />
        <Typography variant="h6" fontWeight={600} color="text.secondary">
          No se encontraron mascotas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Intenta ajustando el nombre, la raza o la ubicación de tu búsqueda.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* EXPLICIT TYPING: 'pet: Pet' prevents the TS7006 implicit any error */}
      {pets.map((pet: Pet) => (
        <Grid item xs={12} sm={6} lg={4} key={pet.id}>
          <PetCard
            id={pet.id}
            nombre={pet.nombre}
            raza={pet.raza}
            edad={pet.edad}
            genero={pet.genero}
            ubicacion={pet.ubicacion}
            imagen={pet.imagen}
          />
        </Grid>
      ))}
    </Grid>
  );
};
