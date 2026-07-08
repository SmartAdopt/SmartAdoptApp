// src/pages/adopter/AdopterRequests.tsx

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  LinearProgress,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { adoptionRequestsService } from "../../services/adoptionRequests.service";
import type { AdoptionRequest } from "../../types/adoption.types";
import type { AIProfileResponse } from "../../types/pets.types";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

type RequestWithPet = AdoptionRequest & { pet: AIProfileResponse };

export const AdopterRequests = () => {
  const [requests, setRequests] = useState<RequestWithPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await adoptionRequestsService.getRequestsWithPetData();
        setRequests(data);
      } catch (error) {
        console.error("Failed to load requests", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const pendingCount = requests.filter(
    (r) => r.status === "under_review",
  ).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const totalCount = requests.length;

  if (isLoading) {
    return (
      <AdopterLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </AdopterLayout>
    );
  }

  return (
    <AdopterLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Mis Solicitudes
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Rastrea el estado de tus solicitudes de adopción
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.50",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "primary.main",
              }}
            >
              <AccessTimeIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Revisión
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "success.50",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "success.main",
              }}
            >
              <CheckCircleOutlineIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {approvedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aprobadas
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "grey.100",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "grey.600",
              }}
            >
              <FavoriteBorderIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {totalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Solicitudes
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Requests List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {requests.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aún no has enviado ninguna solicitud de adopción.
            </Typography>
            <Button variant="contained" href="/adopter/explore" sx={{ mt: 2 }}>
              Explorar Mascotas
            </Button>
          </Box>
        ) : (
          requests.map((request) => {
            const petImage = request.pet.pet.pet_image_url || PUBLIC_ASSETS.dog;
            const petName = request.pet.pet.name;
            const breed =
              request.pet.pet.animal_breed.length > 1
                ? request.pet.pet.animal_breed[1]
                : request.pet.pet.animal_breed[0];
            const age = request.pet.pet.age;
            const size =
              request.pet.pet.weight_kg && request.pet.pet.weight_kg > 15
                ? "Grande"
                : "Pequeño"; // Simple heuristic for size if not explicitly available

            const isApproved = request.status === "approved";
            const statusColor = isApproved ? "success" : "primary";
            const statusLabel = isApproved ? "Approved" : "Under Review";

            return (
              <Card
                key={request.id}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "grey.200",
                  overflow: "hidden",
                }}
              >
                <Grid container>
                  {/* Pet Image */}
                  <Grid item xs={12} sm={4} md={3}>
                    <Box
                      component="img"
                      src={petImage}
                      alt={petName}
                      sx={{
                        width: "100%",
                        height: "100%",
                        minHeight: { xs: 200, sm: 320 },
                        objectFit: "cover",
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = PUBLIC_ASSETS.dog;
                      }}
                    />
                  </Grid>

                  {/* Request Details */}
                  <Grid item xs={12} sm={8} md={9}>
                    <Box sx={{ p: 4 }}>
                      {/* Header (Name + Status) */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Typography variant="h5" fontWeight={700}>
                            {petName}
                          </Typography>
                          <Chip
                            label={statusLabel}
                            size="small"
                            color={statusColor}
                            sx={{ fontWeight: 600, borderRadius: 2 }}
                          />
                        </Box>
                        {isApproved ? (
                          <CheckCircleOutlineIcon color="success" />
                        ) : (
                          <AccessTimeIcon color="primary" />
                        )}
                      </Box>

                      {/* Sub Details */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {breed} • {age} {age === 1 ? "año" : "años"} • {size}
                      </Typography>

                      {/* Progress Bar */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          Progreso de Solicitud
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {request.progressPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={request.progressPercentage}
                        color={statusColor}
                        sx={{ height: 8, borderRadius: 4, mb: 3 }}
                      />

                      {/* Dates */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "flex-start",
                            }}
                          >
                            <EventIcon color="action" fontSize="small" />
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Enviado
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {new Date(
                                  request.dateSubmitted,
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "flex-start",
                            }}
                          >
                            <UpdateIcon color="action" fontSize="small" />
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Última Actualización
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {new Date(
                                  request.lastUpdate,
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Update Message Box */}
                      <Box
                        sx={{
                          bgcolor: "primary.50",
                          border: "1px solid",
                          borderColor: "primary.100",
                          borderRadius: 3,
                          p: 2,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <ChatBubbleOutlineIcon
                            color="primary"
                            fontSize="small"
                          />
                          <Typography variant="subtitle2" fontWeight={700}>
                            Actualización del Equipo SmartAdopt
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {request.updateMessage}
                        </Typography>
                      </Box>

                      {/* Footer Actions */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid",
                          borderColor: "grey.100",
                          pt: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Próximo Paso
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {request.nextStep}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<VisibilityIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            borderColor: "grey.300",
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            );
          })
        )}
      </Box>
    </AdopterLayout>
  );
};
