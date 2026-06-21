// src/pages/adopter/PetProfilePage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  FavoriteBorder as FavoriteIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { petsService } from "../../services/pets.service";
import { usePetDatabase } from "../../context/PetContext";

export const PetProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pets: contextPets } = usePetDatabase();

  // Fetch individual pet data via TanStack Query
  const {
    data: pet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["petDetail", id],
    queryFn: () => petsService.getPetById(id || "", contextPets),
    enabled: !!id, // Only run if ID exists
  });

  if (isLoading) {
    return (
      <AdopterLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </AdopterLayout>
    );
  }

  if (isError || !pet) {
    return (
      <AdopterLayout>
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h5" color="error">
            Mascota no encontrada
          </Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Volver al explorador
          </Button>
        </Box>
      </AdopterLayout>
    );
  }

  return (
    <AdopterLayout>
      {/* HEADER ACTIONS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: "text.secondary", textTransform: "none" }}
        >
          Volver
        </Button>
        <Box>
          <IconButton size="small" sx={{ mr: 1 }}>
            <FavoriteIcon />
          </IconButton>
          <IconButton size="small">
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: Main Info */}
        <Grid item xs={12} md={8}>
          {/* Main Image */}
          <Box
            component="img"
            src={pet.imagen || "/dog.svg"}
            alt={pet.nombre}
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
              borderRadius: 4,
              mb: 4,
              bgcolor: "grey.100",
            }}
          />

          <Typography variant="h4" fontWeight={800} gutterBottom>
            Acerca de {pet.nombre}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", mb: 4 }}
          >
            <LocationIcon fontSize="small" sx={{ mr: 0.5 }} /> {pet.ubicacion}
          </Typography>

          {/* Quick Stats Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Raza
              </Typography>
              <Typography fontWeight={600}>{pet.raza}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Edad
              </Typography>
              <Typography fontWeight={600}>{pet.edad}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Sexo
              </Typography>
              <Typography fontWeight={600}>{pet.genero}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Peso
              </Typography>
              <Typography fontWeight={600}>
                {pet.peso || "No especificado"}
              </Typography>
            </Grid>
          </Grid>

          {/* Health Status */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Salud
          </Typography>
          <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon
                color={pet.esterilizado !== false ? "success" : "disabled"}
                fontSize="small"
              />
              <Typography variant="body2">Esterilizado</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon
                color={pet.vacunado !== false ? "success" : "disabled"}
                fontSize="small"
              />
              <Typography variant="body2">Vacunas al día</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Biography */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Historia de {pet.nombre}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ lineHeight: 1.8 }}
          >
            {pet.biografia ||
              `¡Hola! Soy ${pet.nombre}, un adorable ${pet.raza} que está buscando un hogar lleno de amor. Fui rescatado recientemente y estoy listo para darte toda mi lealtad. Soy muy cariñoso y me encanta jugar.`}
          </Typography>
        </Grid>

        {/* RIGHT COLUMN: Sticky Actions Widget */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: "sticky", top: 24 }}>
            {/* CTA Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.200",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                align="center"
              >
                ¿Consideras a {pet.nombre}?
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Envía tu solicitud de adopción ahora
              </Typography>

              <Button
                variant="contained"
                color="warning"
                fullWidth
                size="large"
                sx={{ mb: 2, borderRadius: 2 }}
              >
                Solicitar Adopción
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2, borderRadius: 2 }}
              >
                Ver Tu Compatibilidad
              </Button>
              <Button variant="text" fullWidth sx={{ color: "text.secondary" }}>
                Guardar Favorito
              </Button>
            </Paper>

            {/* Donation / Info Card */}
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 4, bgcolor: "#F8FAFC" }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
                gutterBottom
              >
                Adopción Gratuita
              </Typography>
              <Typography
                variant="h4"
                fontWeight={800}
                color="success.main"
                gutterBottom
              >
                $0
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                ¡Las adopciones son 100% gratuitas! Puedes hacer una donación
                voluntaria para ayudar a rescatar más animales.
              </Typography>
              <Button
                variant="outlined"
                color="success"
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Hacer una Donación
              </Button>
            </Paper>

            {/* Verification Badge */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 3,
                p: 2,
                bgcolor: "#F0FDF4",
                borderRadius: 3,
                color: "success.dark",
              }}
            >
              <CheckCircleIcon />
              <Typography variant="body2" fontWeight={600}>
                Verificado: Animal sano, vacunado y listo para adopción.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </AdopterLayout>
  );
};
