// src/components/organisms/HowItWorksSection.tsx

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import type { ReactNode } from "react";

// Sub-component (Molecule) defined here for simplicity,
// but could be moved to src/components/molecules if reused.
const StepCard = ({
  icon,
  title,
  description,
  iconBg,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  iconBg: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      border: "1px solid",
      borderColor: "grey.200",
      borderRadius: 3,
    }}
  >
    <Box
      sx={{
        bgcolor: iconBg,
        color: "primary.main",
        p: 1.5,
        borderRadius: "50%",
        mb: 2,
      }}
    >
      {icon}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

export const HowItWorksSection = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ fontWeight: 600, mb: 6 }}
        gutterBottom
      >
        ¿Cómo Funciona SmartAdopt?
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <StepCard
            icon={<img src="/heart.svg" width={28} />}
            iconBg="#E0E7FF" // Light blue
            title="Emparejamiento Inteligente"
            description="El análisis de compatibilidad con IA asegura la coincidencia perfecta entre adoptantes y mascotas según estilo de vida y preferencias."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StepCard
            icon={<img src="/heart.svg" width={28} />}
            iconBg="#DCFCE7" // Light green
            title="Proceso Verificado"
            description="Verificación de identidad y evaluaciones exhaustivas de idoneidad protegen a los animales y aseguran adopciones exitosas."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StepCard
            icon={<img src="/heart.svg" width={28} />}
            iconBg="#FEF3C7" // Light orange/yellow
            title="Seguimiento en Tiempo Real"
            description="Rastrea el estado de las solicitudes, recibe actualizaciones instantáneas y gestiona todo el proceso de adopción en un solo lugar."
          />
        </Grid>
      </Grid>
    </Container>
  );
};
