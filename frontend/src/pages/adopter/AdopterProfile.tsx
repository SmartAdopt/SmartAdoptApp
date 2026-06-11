// src/pages/adopter/AdopterProfile.tsx
import { Box, Typography, Container } from "@mui/material";
import { MainLayout } from "../../components/templates/MainLayout";
import { PreferencesForm } from "../../components/organisms/PreferencesForm";

export const AdopterProfile = () => {
  return (
    <MainLayout userName="Usuario Adoptante" isAdmin={false}>
      <Container maxWidth="md">
        {/* Welcome and Header message */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            component="h1"
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
            adopción, por favor indícanos tus preferencias y estilo de vida.
          </Typography>
        </Box>

        {/* Cuestionario Organism Context */}
        <PreferencesForm />
      </Container>
    </MainLayout>
  );
};
