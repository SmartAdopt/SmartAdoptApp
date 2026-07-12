// src/pages/admin/AdminDashboard.tsx

import { Grid, Typography, Box, Paper, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { AdminWelcomeBanner } from "../../components/organisms/AdminWelcomeBanner";
import { AdminSummaryCard } from "../../components/molecules/AdminSummaryCard";
import { AdminActionCard } from "../../components/molecules/AdminActionCard";
import { adoptionFormService } from "../../services/adoptionForm.service";

import {
  Pets as PetsIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  AccountBalanceOutlined as AccountBalanceOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => adoptionFormService.getDashboardStats(),
  });

  return (
    <AdminLayout>
      <AdminWelcomeBanner />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* STATS GRID */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <AdminSummaryCard
                value={stats?.total_pets ?? 0}
                label="Total Mascotas Creadas"
                icon={<PetsIcon />}
                iconBgColor="#EFF6FF"
                iconColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AdminSummaryCard
                value={stats?.adopted_pets ?? 0}
                label="Adopciones Exitosas"
                icon={<CheckCircleOutlineIcon />}
                iconBgColor="#F0FDF4"
                iconColor="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AdminSummaryCard
                value={stats?.pending_applications ?? 0}
                label="Solicitudes Pendientes"
                icon={<DescriptionOutlinedIcon />}
                iconBgColor="#FEFCE8"
                iconColor="warning.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AdminSummaryCard
                value={stats?.available_pets ?? 0}
                label="Disponibles para Adopción"
                icon={<GroupsOutlinedIcon />}
                iconBgColor="#FAF5FF"
                iconColor="secondary.main"
              />
            </Grid>
          </Grid>
        </>
      )}

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
            onClick={() => navigate("/admin/requests")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Añadir Mascota"
            description="Sube nuevos animales rescatados"
            icon={<AddCircleOutlineIcon fontSize="large" />}
            buttonColor="success"
            onClick={() => navigate("/admin/pets/new")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Lista de Adoptados"
            description="Ver adopciones exitosas"
            icon={<CheckCircleOutlineIcon fontSize="large" />}
            buttonColor="warning"
            onClick={() => navigate("/admin/pets/adopted")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Vista Interactiva"
            description="Previsualiza tarjetas de mascotas"
            icon={<VisibilityOutlinedIcon fontSize="large" />}
            buttonColor="secondary"
            onClick={() => navigate("/admin/pets")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminActionCard
            title="Datos Legales"
            description="Información legal de la organización"
            icon={<AccountBalanceOutlinedIcon fontSize="large" />}
            buttonColor="info"
            onClick={() => navigate("/admin/legal-info")}
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
        {[
          "Generador de Biografías IA",
          "Motor de Emparejamiento",
          "Sistema de Notificaciones",
        ].map((item) => (
          <Box key={item} sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              ● {item}
            </Typography>
            <Typography variant="body2" color="success.main">
              Activo
            </Typography>
          </Box>
        ))}
      </Paper>
    </AdminLayout>
  );
};
