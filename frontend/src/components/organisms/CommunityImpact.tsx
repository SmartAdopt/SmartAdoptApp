import {
  Paper,
  Typography,
  Grid,
} from "@mui/material";

import PetsIcon from "@mui/icons-material/Pets";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupsIcon from "@mui/icons-material/Groups";

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
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 3 }}
      >
        Impacto de la Comunidad
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            titulo="Mascotas Adoptadas"
            valor="1,245"
            icono={<PetsIcon color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            titulo="Familias Felices"
            valor="987"
            icono={<FavoriteIcon color="error" />}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            titulo="Usuarios Activos"
            valor="5,321"
            icono={<GroupsIcon color="success" />}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};