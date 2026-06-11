// src/components/organisms/PreferencesForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Divider,
} from "@mui/material";

// Contract interface for future backend state integration
interface AdoptionPreferences {
  petType: string;
  homeSpace: string;
  activityLevel: number;
  petAgeRange: number[];
}

export const PreferencesForm = () => {
  const navigate = useNavigate();

  // Local state initialized with clean default values
  const [preferences, setPreferences] = useState<AdoptionPreferences>({
    petType: "dog",
    homeSpace: "apartment",
    activityLevel: 2,
    petAgeRange: [1, 5],
  });

  const handlePetTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (newValue) setPreferences((prev) => ({ ...prev, petType: newValue }));
  };

  const handleSpaceChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (newValue) setPreferences((prev) => ({ ...prev, homeSpace: newValue }));
  };

  const handleActivityChange = (_: Event, newValue: number | number[]) => {
    setPreferences((prev) => ({ ...prev, activityLevel: newValue as number }));
  };

  const handleAgeChange = (_: Event, newValue: number | number[]) => {
    setPreferences((prev) => ({ ...prev, petAgeRange: newValue as number[] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving user preferences to Backend/Local DB:", preferences);

    // Once configuration is completed, redirect user to their personalized feed
    navigate("/adopter/dashboard");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Section 1: Preferred Pet Type */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              1. ¿Qué tipo de mascota estás buscando?
            </Typography>
            <ToggleButtonGroup
              value={preferences.petType}
              exclusive
              onChange={handlePetTypeChange}
              fullWidth
              sx={{
                gap: 2,
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  border: "1px solid !important",
                },
              }}
            >
              <ToggleButton
                value="dog"
                sx={{
                  py: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                🐶 Perros
              </ToggleButton>
              <ToggleButton
                value="cat"
                sx={{
                  py: 2,
                  "&.Mui-selected": {
                    bgcolor: "#22C55E", // Using exact success color token for Cats as defined in theme.ts
                    color: "#FFFFFF",
                    "&:hover": { bgcolor: "#16A34A" },
                  },
                }}
              >
                🐱 Gatos
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Section 2: Home Space */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              2. ¿Cómo es el espacio en tu hogar?
            </Typography>
            <ToggleButtonGroup
              value={preferences.homeSpace}
              exclusive
              onChange={handleSpaceChange}
              fullWidth
              orientation="vertical"
              sx={{
                gap: 1,
                "& .MuiToggleButton-root": {
                  borderRadius: 1,
                  border: "1px solid !important",
                },
              }}
            >
              <ToggleButton
                value="apartment"
                sx={{ py: 1.5, justifyContent: "flex-start", px: 3 }}
              >
                🏢 Departamento / Suite
              </ToggleButton>
              <ToggleButton
                value="house_no_yard"
                sx={{ py: 1.5, justifyContent: "flex-start", px: 3 }}
              >
                🏠 Casa sin patio interno
              </ToggleButton>
              <ToggleButton
                value="house_yard"
                sx={{ py: 1.5, justifyContent: "flex-start", px: 3 }}
              >
                🏡 Casa con patio o jardín
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Section 3: Activity Level */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              3. ¿Cuál es tu nivel de actividad diaria o tiempo para paseos?
            </Typography>
            <Box sx={{ px: 2, mt: 2 }}>
              <Slider
                value={preferences.activityLevel}
                onChange={handleActivityChange}
                step={1}
                marks={[
                  { value: 1, label: "Tranquilo (Poco tiempo)" },
                  { value: 2, label: "Moderado (Paseos diarios)" },
                  { value: 3, label: "Muy Activo (Ejercicio intenso)" },
                ]}
                min={1}
                max={3}
                valueLabelDisplay="off"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Section 4: Age Preference */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              4. Rango de edad preferido de la mascota (Años)
            </Typography>
            <Box sx={{ px: 2, mt: 2, mb: 2 }}>
              <Slider
                value={preferences.petAgeRange}
                onChange={handleAgeChange}
                valueLabelDisplay="auto"
                min={0}
                max={15}
                marks={[
                  { value: 0, label: "Cachorro" },
                  { value: 5, label: "5 años" },
                  { value: 10, label: "10 años" },
                  { value: 15, label: "Senior (15+)" },
                ]}
              />
            </Box>
          </Grid>

          {/* Submit Action */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disableElevation
              sx={{ py: 1.5, fontSize: "1rem" }}
            >
              Completar Perfil y Buscar Mi Mascota Ideal
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
