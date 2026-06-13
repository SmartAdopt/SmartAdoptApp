// src/components/organisms/CommunityImpact.tsx

import { Paper, Typography, Grid } from "@mui/material";

import {
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";

import { StatCard } from "../atoms/StatCard";

export const CommunityImpact = () => {
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
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
        Impacto de la Comunidad
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            titulo="Mascotas Adoptadas"
            valor="1,245"
            icono={<PetsIcon sx={{ color: "primary.main" }} />}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            titulo="Familias Felices"
            valor="987"
            icono={<FavoriteIcon sx={{ color: "error.main" }} />}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            titulo="Usuarios Activos"
            valor="5,321"
            icono={<GroupsIcon sx={{ color: "success.main" }} />}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
