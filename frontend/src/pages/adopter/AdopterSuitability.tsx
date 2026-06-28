// src/pages/adopter/AdopterSuitability.tsx

import { useState, useEffect } from "react";
import { Box, Typography, Container, Paper, Grid, Button } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { PetCard } from "../../components/molecules/PetCard";
import { useQuery } from "@tanstack/react-query";
import { petsService } from "../../services/pets.service";
import type { AIProfileResponse } from "../../types/pets.types";
import { useNavigate } from "react-router-dom";

export const AdopterSuitability = () => {
  const { data: realPets = [] } = useQuery<AIProfileResponse[]>({
    queryKey: ["featuredPets"],
    queryFn: petsService.getRawPetsDatabase,
    staleTime: 1000 * 60 * 5,
  });

  // Pick 3 random pets from the database
  const [aiMatchedPets, setAiMatchedPets] = useState<AIProfileResponse[]>([]);

  useEffect(() => {
    const available = realPets.filter(
      (pet) => pet.status?.toLowerCase() !== "adopted",
    );
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAiMatchedPets(shuffled.slice(0, 3));
  }, [realPets]);

  // Initialize state from localStorage to simulate persistence
  const [isSurveyCompleted] = useState(() => {
    return !!localStorage.getItem("suitabilitySurveyData");
  });

  const navigate = useNavigate();

  const handleRedoSurvey = () => {
    navigate("/adopter/suitability/survey?redo=true");
  };

  return (
    <AdopterLayout>
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 0 } }}>
        {/* CONDITIONAL RENDER based on survey completion */}
        {!isSurveyCompleted ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "primary.light",
              bgcolor: "#EFF6FF", // Very light blue (Tailwind blue-50)
              mb: 5,
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <AutoAwesomeIcon
                sx={{ fontSize: 56, color: "primary.main", mb: 2 }}
              />
              <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
                color="text.primary"
              >
                ¡Encuentra a tu compañero ideal! 🐶🐱
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto", mb: 4 }}
              >
                Para asegurarnos de que tu futura mascota se adapte
                perfectamente a tu estilo de vida, te invitamos a llenar este
                breve registro. Solo tomará unos minutos y nos ayudará a
                encontrar el match perfecto.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/adopter/suitability/survey")}
                >
                  Llenar el registro por primera vez
                </Button>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "success.light",
              bgcolor: "#F0FDF4", // Very light green
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
                ¡Encuesta Completada Exitosamente! 🎉
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto", mb: 4 }}
              >
                Gracias por llenar la encuesta. Nuestro sistema inteligente ha
                registrado tus preferencias y condiciones para encontrar a tu
                compañero ideal.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => navigate("/adopter/suitability/survey")}
                >
                  Ver y Editar Formulario
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={handleRedoSurvey}
                >
                  Hacer de nuevo la encuesta
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

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

          {isSurveyCompleted ? (
            <Grid container spacing={3}>
              {aiMatchedPets.map((profile) => {
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
                  <Grid item xs={12} sm={6} md={4} key={profile.id}>
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
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px dashed",
                borderColor: "grey.400",
                textAlign: "center",
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aún no podemos calcular tus coincidencias
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completa tu registro de idoneidad primero para que nuestra IA
                pueda recomendarte las mascotas perfectas para ti.
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </AdopterLayout>
  );
};
