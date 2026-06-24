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
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteFilledIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { petsService } from "../../services/pets.service";
import { usePetDatabase } from "../../context/PetContext";
import type { AIProfileResponse } from "../../types/pets.types";

export const PetProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { favoritePetIds, toggleFavorite } = usePetDatabase();

  // Fetch all pets from the real backend API and find the one matching :id
  const {
    data: pet,
    isLoading,
    isError,
  } = useQuery<AIProfileResponse | undefined>({
    queryKey: ["petDetail", id],
    queryFn: async () => {
      const allPets = await petsService.getRawPetsDatabase();
      return allPets.find((p) => p.id === id);
    },
    enabled: !!id,
  });

  const isFavorite = id ? favoritePetIds.includes(id) : false;

  const handleToggleFavorite = () => {
    if (id) toggleFavorite(id);
  };

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

  // Derive display values from the AIProfileResponse structure
  const petName = pet.pet.name;
  const petAge = pet.pet.age;
  const petBreed =
    pet.pet.animal_breed.length > 1
      ? pet.pet.animal_breed[1]
      : pet.pet.animal_breed[0];
  const petAnimalType = pet.pet.animal_breed[0];
  const petImage = pet.pet.pet_image_url;
  const petGender = pet.pet.gender === "male" ? "Macho" : "Hembra";
  const petWeight = pet.pet.weight_kg
    ? `${pet.pet.weight_kg} kg`
    : "No especificado";
  const isSterilized = pet.pet.is_sterilized;
  const isDewormed = pet.pet.dewormed;
  const hasVaccines =
    pet.pet.vaccines_up_to_date && pet.pet.vaccines_up_to_date.length > 0;
  const description = pet.emotional_description;
  const briefDescription = pet.pet.brief_description;
  const specialConditions = pet.pet.special_conditions || [];
  const tags = pet.tags || [];

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
          <IconButton
            size="small"
            sx={{ mr: 1 }}
            onClick={handleToggleFavorite}
            color={isFavorite ? "error" : "default"}
          >
            {isFavorite ? <FavoriteFilledIcon /> : <FavoriteBorderIcon />}
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
            src={petImage || "/dog.svg"}
            alt={petName}
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
              borderRadius: 4,
              mb: 4,
              bgcolor: "grey.100",
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = "/dog.svg";
            }}
          />

          <Typography variant="h4" fontWeight={800} gutterBottom>
            Acerca de {petName}
          </Typography>

          {/* Tags row */}
          {tags.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {tags.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}

          {/* Quick Stats Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Raza
              </Typography>
              <Typography fontWeight={600}>{petBreed}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Edad
              </Typography>
              <Typography fontWeight={600}>
                {petAge} {petAge === 1 ? "año" : "años"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Sexo
              </Typography>
              <Typography fontWeight={600}>{petGender}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Peso
              </Typography>
              <Typography fontWeight={600}>{petWeight}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Tipo
              </Typography>
              <Typography fontWeight={600} sx={{ textTransform: "capitalize" }}>
                {petAnimalType}
              </Typography>
            </Grid>
          </Grid>

          {/* Health Status */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Salud
          </Typography>
          <Box sx={{ display: "flex", gap: 3, mb: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon
                color={isSterilized ? "success" : "disabled"}
                fontSize="small"
              />
              <Typography variant="body2">Esterilizado</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon
                color={hasVaccines ? "success" : "disabled"}
                fontSize="small"
              />
              <Typography variant="body2">Vacunas al día</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon
                color={isDewormed ? "success" : "disabled"}
                fontSize="small"
              />
              <Typography variant="body2">Desparasitado</Typography>
            </Box>
          </Box>

          {/* Vaccine details */}
          {hasVaccines && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Vacunas aplicadas:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {pet.pet.vaccines_up_to_date.map((vaccine, idx) => (
                  <Chip
                    key={idx}
                    label={vaccine}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Special conditions */}
          {specialConditions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Condiciones especiales:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {specialConditions.map((condition, idx) => (
                  <Chip
                    key={idx}
                    label={condition}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* AI-Generated Emotional Description */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Historia de {petName}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ lineHeight: 1.8 }}
          >
            {description}
          </Typography>

          {/* Original brief description from admin */}
          {briefDescription && (
            <>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                sx={{ mt: 2 }}
              >
                Descripción del rescatista
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                paragraph
                sx={{
                  lineHeight: 1.8,
                  fontStyle: "italic",
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                "{briefDescription}"
              </Typography>
            </>
          )}
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
                ¿Consideras a {petName}?
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
              <Button
                variant="text"
                fullWidth
                sx={{
                  color: isFavorite ? "error.main" : "text.secondary",
                }}
                onClick={handleToggleFavorite}
                startIcon={
                  isFavorite ? <FavoriteFilledIcon /> : <FavoriteBorderIcon />
                }
              >
                {isFavorite ? "Guardado en Favoritos" : "Guardar Favorito"}
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
