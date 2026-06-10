// src/pages/adopter/AdopterDashboard.tsx
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton,
  Avatar
} from "@mui/material";

// Iconos exactos para replicar el diseño
import PetsIcon from "@mui/icons-material/Pets";
import DescriptionIcon from "@mui/icons-material/Description";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

// Importación del Layout que ya creamos
import { MainLayout } from "../../components/templates/MainLayout";

// --- DATOS MOCK BASADOS EN TU IMAGEN ---
const metrics = [
  { 
    id: 1, 
    title: "Mascotas Disponibles", 
    value: 24, 
    icon: <PetsIcon sx={{ color: "#10B981" }} />, 
    bg: "#D1FAE5" 
  },
  { 
    id: 2, 
    title: "Solicitudes Pendientes", 
    value: 12, 
    icon: <DescriptionIcon sx={{ color: "#3B82F6" }} />, 
    bg: "#DBEAFE" 
  },
  { 
    id: 3, 
    title: "Adopciones (Mes)", 
    value: 8, 
    icon: <FavoriteIcon sx={{ color: "#8B5CF6" }} />, 
    bg: "#EDE9FE" 
  },
];

const recentPets = [
  { id: "1", name: "Max", species: "Perro", status: "Disponible" },
  { id: "2", name: "Luna", species: "Gato", status: "Disponible" },
  { id: "3", name: "Rocky", species: "Perro", status: "Pendiente" },
  { id: "4", name: "Bella", species: "Gato", status: "Disponible" },
];

export const AdopterDashboard = () => {
  return (
    // Pongo isAdmin={true} para que se vea el menú lateral oscuro de tu imagen
    <MainLayout userName="Fundación Patitas" isAdmin={true}>
      
      {/* ==============================
          ENCABEZADO FIEL A LA IMAGEN
          ============================== */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, Fundación Patitas
        </Typography>
      </Box>

      {/* ==============================
          TARJETAS DE MÉTRICAS
          ============================== */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={4} key={metric.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 2,
              }}
            >
              <Avatar sx={{ bgcolor: metric.bg, width: 56, height: 56, mr: 2 }}>
                {metric.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  {metric.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {metric.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ==============================
          TABLA DE MASCOTAS RECIENTES
          ============================== */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Mascotas Agregadas Recientemente
      </Typography>
      
      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Especie</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", color: "text.secondary" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentPets.map((pet) => (
              <TableRow key={pet.id} hover>
                <TableCell sx={{ fontWeight: "medium" }}>{pet.name}</TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell>
                  <Chip
                    label={pet.status}
                    size="small"
                    sx={{
                      fontWeight: "bold",
                      bgcolor: pet.status === "Disponible" ? "#D1FAE5" : "#FEF3C7",
                      color: pet.status === "Disponible" ? "#065F46" : "#92400E",
                      borderRadius: 1.5
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" sx={{ color: "primary.main", mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: "error.main" }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </MainLayout>
  );
};