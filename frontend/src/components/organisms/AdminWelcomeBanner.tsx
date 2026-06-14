// src/components/organisms/AdminWelcomeBanner.tsx

import { Paper, Typography, Button, Box } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

export const AdminWelcomeBanner = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#059669", // Green background for admin banner
        color: "white",
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        mb: 4,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Bienvenido, Administrador
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Estás gestionando la conexión entre 5 mascotas disponibles y 4
          solicitudes pendientes.
        </Typography>
      </Box>
      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          "&:hover": { bgcolor: "grey.100" },
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        Revisar Solicitudes
      </Button>
    </Paper>
  );
};
