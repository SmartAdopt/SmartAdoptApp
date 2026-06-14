// src/components/organisms/QuickActionsPanel.tsx

import { Paper, Typography, Grid } from "@mui/material";

import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { QuickActionButton } from "../atoms/QuickActionButton";

export const QuickActionsPanel = () => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Acciones Rápidas
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <QuickActionButton
            titulo="Explorar"
            icono={<SearchIcon />}
            onClick={() => navigate("/adopter/explore")}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <QuickActionButton
            titulo="Favoritos"
            icono={<FavoriteIcon />}
            onClick={() => navigate("/adopter/favorites")}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <QuickActionButton
            titulo="Mi Perfil"
            icono={<PersonIcon />}
            onClick={() => navigate("/adopter/profile")}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <QuickActionButton
            titulo="Solicitudes"
            icono={<DescriptionIcon />}
            onClick={() => navigate("/adopter/requests")}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
