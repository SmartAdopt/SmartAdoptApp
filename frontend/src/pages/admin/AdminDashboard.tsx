// src/pages/admin/AdminDashboard.tsx

import { Typography, Grid, Box } from "@mui/material";
import { MainLayout } from "../../components/templates/MainLayout";
import { PetCard, type Pet } from "../../components/molecules/PetCard";

// MOCK DATA
const MOCK_PETS: Pet[] = [
  { id: "1", name: "Max", breed: "Mestizo", age: "2 años", matchPercentage: 98 },
  { id: "2", name: "Luna", breed: "Labrador", age: "6 meses", matchPercentage: 95 },
  { id: "3", name: "Rocky", breed: "Bulldog", age: "3 años", matchPercentage: 89 },
];

export const AdminDashboard = () => {
  const handleAdoptClick = (petId: string) => {
    console.log(`Action triggered: View profile for pet ID ${petId}`);
  };

  return (
    <MainLayout userName="Usuario Adoptante" isAdmin={false}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Tus coincidencias ideales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Basado en tu perfil, nuestra IA ha encontrado estas mascotas que harían la familia perfecta contigo.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {MOCK_PETS.map((pet) => (
          <Grid item xs={12} sm={6} md={4} key={pet.id}>
            <PetCard pet={pet} onAdoptClick={handleAdoptClick} />
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
};