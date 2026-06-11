import { Typography, Paper } from "@mui/material";
import { MainLayout } from "../../components/templates/MainLayout";

export const AdminDashboard = () => {
  return (
    <MainLayout userName="Administrador" isAdmin={true}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Panel Administrativo
        </Typography>

        <Typography color="text.secondary">
          Esta sección se encuentra en proceso de rediseño.
        </Typography>
      </Paper>
    </MainLayout>
  );
};