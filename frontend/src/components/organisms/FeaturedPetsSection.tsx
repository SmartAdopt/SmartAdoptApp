// src/components/organisms/FeaturedPetsSection.tsx

import { Paper, Typography, Grid, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- NEW: Import useNavigate
import { dashboardService } from "../../services/dashboard.service";
import { type Pet } from "../../types/dashboard.types";
import { PetCard } from "../molecules/PetCard";

export const FeaturedPetsSection = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const navigate = useNavigate(); // <-- NEW: Initialize router hook

  useEffect(() => {
    const loadPets = async () => {
      const data = await dashboardService.getFeaturedPets();
      setPets(data);
    };

    loadPets();
  }, []);

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
          {/* 👇 MODIFIED BUTTON ACTION 👇 */}
          <Button onClick={() => navigate("/adopter/explore")}>
            Ver Todas
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {pets.map((pet) => (
          <Grid item xs={12} md={6} lg={4} key={pet.id}>
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
    </Paper>
  );
};
