import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Chip,
  Avatar,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { adoptionRequestsService } from "../../services/adoptionRequests.service";
import { foundationService } from "../../services/foundation.service";
import { notificationService } from "../../services/notification.service";
import type { LegalInfoFormData } from "../../services/foundation.service";
import type { AdoptionRequest } from "../../types/adoption.types";
import type { AIProfileResponse } from "../../types/pets.types";
import { useNavigate } from "react-router-dom";

export type RequestWithPet = AdoptionRequest & { pet: AIProfileResponse };

export const AdopterRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithPet | null>(
    null
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [foundationInfo, setFoundationInfo] =
    useState<LegalInfoFormData | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await adoptionRequestsService.getRequestsWithPetData();
        setRequests(data);
        if (data.length > 0) {
          setSelectedRequest(data[0]);
        }

        // Fetch foundation info for approved cases if any are approved
        if (data.some((r) => r.status === "approved")) {
          try {
            const found = await foundationService.getFoundation();
            setFoundationInfo(found);
          } catch (foundError) {
            console.warn("Could not load foundation info", foundError);
          }
        }
      } catch (error) {
        console.error("Failed to load requests", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Mark all notifications as read automatically when entering this page
    const clearNotifications = async () => {
      try {
        await notificationService.markAllAsRead();
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    };

    fetchRequests();
    clearNotifications();

    // Listen for real-time status updates via WebSocket
    const handleUpdate = () => {
      fetchRequests();
    };
    window.addEventListener("application_status_update", handleUpdate);

    return () => {
      window.removeEventListener("application_status_update", handleUpdate);
    };
  }, []);

  const handleDownloadCertificate = async () => {
    if (!selectedRequest) return;
    setIsGeneratingPdf(true);
    try {
      const { generateCertificate } = await import(
        "../../utils/certificateGenerator"
      );
      await generateCertificate(selectedRequest, selectedRequest.pet);
    } catch (error) {
      console.error("Failed to generate certificate", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const pendingCount = requests.filter(
    (r) => r.status === "under_review"
  ).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const totalCount = requests.length;

  const getStatusChip = (status: string) => {
    switch (status) {
      case "approved":
        return <Chip label="Aprobada" color="success" size="small" />;
      case "rejected":
        return <Chip label="Rechazada" color="error" size="small" />;
      default:
        return <Chip label="En Revisión" color="warning" size="small" />;
    }
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Mis Solicitudes
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Rastrea el estado de tus solicitudes de adopción
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
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
                bgcolor: "warning.50",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "warning.main",
              }}
            >
              <AccessTimeIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Revisión
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
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
              <Typography variant="h6" fontWeight={700}>
                {approvedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aprobadas
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
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
                bgcolor: "error.50",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "error.main",
              }}
            >
              <FavoriteBorderIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {rejectedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rechazadas
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
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
              <Typography variant="h6" fontWeight={700}>
                {totalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {requests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Aún no has enviado ninguna solicitud de adopción.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/adopter/explore")}
            sx={{ mt: 2 }}
          >
            Explorar Mascotas
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4} sx={{ pb: 6 }}>
          {/* LEFT: Request List */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Lista de solicitudes
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {requests.map((request) => (
                <Card
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor:
                      selectedRequest?.id === request.id
                        ? "primary.main"
                        : "grey.200",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { borderColor: "primary.main" },
                    boxShadow: selectedRequest?.id === request.id ? 2 : 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={request.pet.pet.pet_image_url}
                      alt={request.pet.pet.name}
                      sx={{ width: 50, height: 50, borderRadius: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={700}>
                        {request.pet.pet.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {new Date(request.dateSubmitted).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {getStatusChip(request.status)}
                  </Box>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* RIGHT: Request Details */}
          <Grid item xs={12} md={8}>
            {selectedRequest ? (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
                elevation={0}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <Avatar
                      src={selectedRequest.pet.pet.pet_image_url}
                      alt={selectedRequest.pet.pet.name}
                      sx={{ width: 80, height: 80, borderRadius: 2 }}
                    />
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        {selectedRequest.pet.pet.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedRequest.pet.pet.animal_breed?.length
                          ? selectedRequest.pet.pet.animal_breed[0]
                          : "Desconocida"}{" "}
                        • {selectedRequest.pet.pet.age} años •{" "}
                        {selectedRequest.pet.pet.gender === "male"
                          ? "Macho"
                          : "Hembra"}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusChip(selectedRequest.status)}
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Fecha de envío
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(
                        selectedRequest.dateSubmitted
                      ).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Revisada por
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedRequest.reviewedByName || "Pendiente"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Última actualización
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(
                        selectedRequest.lastUpdate
                      ).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {selectedRequest.status === "approved" && (
                  <Box
                    sx={{
                      bgcolor: "success.50",
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "success.200",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="success.dark"
                      gutterBottom
                    >
                      ¡Felicidades! Tu adopción fue aprobada por{" "}
                      {selectedRequest.reviewedByName || "el equipo"}.
                    </Typography>

                    {foundationInfo ? (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ mt: 3, mb: 1 }}
                        >
                          📋 Información de la Fundación
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Ubicación:</strong>{" "}
                              {foundationInfo.address}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Teléfono:</strong> {foundationInfo.phone}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Encargado:</strong>{" "}
                              {foundationInfo.legalRepresentative}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                        Nos pondremos en contacto contigo pronto para finalizar
                        el proceso.
                      </Typography>
                    )}

                    <Button
                      variant="contained"
                      color="success"
                      startIcon={
                        isGeneratingPdf ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <DownloadIcon />
                        )
                      }
                      onClick={handleDownloadCertificate}
                      disabled={isGeneratingPdf}
                      sx={{ mt: 3 }}
                      disableElevation
                    >
                      {isGeneratingPdf
                        ? "Generando..."
                        : "Descargar Certificado"}
                    </Button>
                  </Box>
                )}

                {selectedRequest.status === "rejected" && (
                  <Box
                    sx={{
                      bgcolor: "grey.50",
                      p: 4,
                      borderRadius: 2,
                      textAlign: "center",
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      ¡No te preocupes!
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, maxWidth: 500, mx: "auto" }}
                    >
                      Tu solicitud para adoptar a{" "}
                      <strong>{selectedRequest.pet.pet.name}</strong> no fue
                      aprobada en esta ocasión. Cada intento nos acerca más al
                      candidato ideal. Te animamos a seguir explorando nuestras
                      mascotas y enviar nuevas solicitudes. ¡El compañero
                      perfecto te está esperando!
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate("/adopter/explore")}
                      disableElevation
                    >
                      Explorar Mascotas
                    </Button>
                  </Box>
                )}

                {selectedRequest.status === "under_review" && (
                  <Box
                    sx={{
                      bgcolor: "warning.50",
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "warning.200",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="warning.dark"
                      gutterBottom
                    >
                      Tu solicitud está siendo revisada
                    </Typography>
                    <Typography variant="body2" color="warning.dark">
                      Nuestro equipo está evaluando tu perfil. Te notificaremos
                      pronto.
                    </Typography>
                  </Box>
                )}
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  bgcolor: "grey.50",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "grey.300",
                }}
              >
                <Typography color="text.secondary">
                  Selecciona una solicitud para ver los detalles
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </AdopterLayout>
  );
};
