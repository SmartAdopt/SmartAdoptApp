// src/pages/adopter/AdopterSuitability.tsx

import { Box, Typography, Container, Paper, Grid } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { PreferencesForm } from "../../components/organisms/PreferencesForm";
import { PetCard } from "../../components/molecules/PetCard";
import { usePetDatabase } from "../../context/PetContext";

export const AdopterSuitability = () => {
  const { pets } = usePetDatabase();

  // Simulate AI matching by taking the first 3 pets from our local database
  const aiMatchedPets = pets.slice(0, 3);

  return (
    <AdopterLayout>
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 0 } }}>
        {/* SUCCESS BANNER & FORM CONTAINER */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "success.light",
            bgcolor: "#F0FDF4", // Very light green matching the Figma design
            mb: 5,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 56, color: "success.main", mb: 2 }}
            />
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              color="text.primary"
            >
              ¡Registro Completado Exitosamente! 🎉
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Para que nuestro sistema inteligente basado en IA realice un
              emparejamiento preciso y te muestre las mejores opciones de
              adopción, completa o actualiza tu formulario de idoneidad.
            </Typography>
          </Box>

          {/* Render the actual survey form inside the success card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 4,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <PreferencesForm />
          </Box>
        </Paper>

        {/* AI BEST MATCHES SECTION */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
          >
            <AutoAwesomeIcon color="primary" /> Tus Mejores Coincidencias IA
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Basado en tu perfil, estas son las mascotas más compatibles contigo.
          </Typography>

          <Grid container spacing={3}>
            {aiMatchedPets.map((pet) => (
              <Grid item xs={12} sm={6} md={4} key={pet.id}>
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
        </Box>
      </Container>
    </AdopterLayout>
  );
};
