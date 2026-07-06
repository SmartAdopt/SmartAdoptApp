// src/pages/admin/AdminPetListPage.tsx

import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { petsService } from "../../services/pets.service";
import type { AIProfileResponse } from "../../types/pets.types";

export const AdminPetListPage = () => {
  const navigate = useNavigate();

  const {
    data: rawPets,
    isLoading,
    isError,
  } = useQuery<AIProfileResponse[]>({
    queryKey: ["adminRawPets"],
    queryFn: petsService.getRawPetsDatabase,
  });

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/dashboard")}
          sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
        >
          Volver al Dashboard
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Registro de Mascotas
            </Typography>
            <Typography color="text.secondary">
              Vista de base de datos cruda generada por IA (Llama 3).
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/pets/new")}
          >
            Añadir Mascota
          </Button>
        </Box>
      </Box>

      {isLoading && <CircularProgress />}

      {isError && (
        <Typography color="error">
          Error cargando registros del servidor.
        </Typography>
      )}

      {rawPets && rawPets.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {rawPets.map((profile) => (
            <Paper
              key={profile.id}
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: "flex", gap: 3 }}>
                <img
                  src={profile.pet.pet_image_url}
                  alt={profile.pet.name}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {profile.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>ID:</strong> {profile.id} | <strong>Status:</strong>{" "}
                    {profile.status}
                  </Typography>

                  <Box
                    sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
                  >
                    {profile.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: "italic",
                      bgcolor: "grey.50",
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    "{profile.emotional_description}"
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        !isLoading &&
        !isError && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay mascotas registradas todavía
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Haz clic en "Añadir Mascota" para registrar la primera.
            </Typography>
          </Box>
        )
      )}
    </AdminLayout>
  );
};
