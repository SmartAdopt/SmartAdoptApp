import { Grid, Typography, Box, Paper } from "@mui/material";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { AdminWelcomeBanner } from "../../components/organisms/AdminWelcomeBanner";
import { AdminSummaryCard } from "../../components/molecules/AdminSummaryCard";
import { AdminActionCard } from "../../components/molecules/AdminActionCard";

// Icons
import {
  Pets as PetsIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";

export const AdminDashboard = () => {
  return (
    <AdminLayout>
      <AdminWelcomeBanner />

      {/* STATS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AdminSummaryCard
            value={8}
            label="Total Mascotas Creadas"
            icon={<PetsIcon />}
            iconBgColor="#EFF6FF"
            iconColor="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminSummaryCard
            value={2}
            label="Adopciones Exitosas"
            icon={<CheckCircleOutlineIcon />}
            iconBgColor="#F0FDF4"
            iconColor="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminSummaryCard
            value={4}
            label="Solicitudes Pendientes"
            icon={<DescriptionOutlinedIcon />}
            iconBgColor="#FEFCE8"
            iconColor="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminSummaryCard
            value={5}
            label="Disponibles para Adopción"
            icon={<GroupsOutlinedIcon />}
            iconBgColor="#FAF5FF"
            iconColor="secondary.main"
          />
        </Grid>
      </Grid>

      {/* QUICK ACTIONS */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Acciones Rápidas
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Revisar Solicitudes"
            description="Aprueba o rechaza adoptantes"
            icon={<DescriptionOutlinedIcon fontSize="large" />}
            buttonColor="primary"
            onClick={() => console.log("Revisar Solicitudes")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Añadir Mascota"
            description="Sube nuevos animales rescatados"
            icon={<AddCircleOutlineIcon fontSize="large" />}
            buttonColor="success"
            onClick={() => console.log("Añadir Mascota")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Lista de Adoptados"
            description="Ver adopciones exitosas"
            icon={<CheckCircleOutlineIcon fontSize="large" />}
            buttonColor="warning"
            onClick={() => console.log("Lista Adoptados")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Vista Interactiva"
            description="Previsualiza tarjetas de mascotas"
            icon={<VisibilityOutlinedIcon fontSize="large" />}
            buttonColor="secondary"
            onClick={() => console.log("Vista Interactiva")}
          />
        </Grid>
      </Grid>

      {/* SYSTEM STATUS */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Estado del Sistema
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        {/* Placeholder para la lista de estados del sistema que vemos en tu prototipo */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2" fontWeight={500}>
            ● Generador de Biografías IA
          </Typography>
          <Typography variant="body2" color="success.main">
            Activo
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2" fontWeight={500}>
            ● Motor de Emparejamiento
          </Typography>
          <Typography variant="body2" color="success.main">
            Activo
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" fontWeight={500}>
            ● Sistema de Notificaciones
          </Typography>
          <Typography variant="body2" color="success.main">
            Activo
          </Typography>
        </Box>
      </Paper>
    </AdminLayout>
  );
};
