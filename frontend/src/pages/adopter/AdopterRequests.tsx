// src/pages/adopter/AdopterRequests.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  Pets as PetsIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { adoptionRequestsService } from "../../services/adoptionRequests.service";
import type { AdoptionRequest } from "../../types/adoption.types";
import type { AIProfileResponse } from "../../types/pets.types";
import { AdopterRequestCard } from "../../components/molecules/AdopterRequestCard";

export type RequestWithPet = AdoptionRequest & { pet: AIProfileResponse };

export const AdopterRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<RequestWithPet | null>(
    null
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["adopterRequests"],
    queryFn: adoptionRequestsService.getRequestsWithPetData,
  });

  const pendingCount = requests.filter(
    (r) => r.status === "under_review"
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 6, pb: 6 }}>
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
          <>
            {/* Pendientes */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Solicitudes Pendientes
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {requests.filter((r) => r.status === "under_review").length ===
                0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No tienes solicitudes pendientes.
                  </Typography>
                ) : (
                  requests
                    .filter((r) => r.status === "under_review")
                    .map((r) => (
                      <AdopterRequestCard
                        key={r.id}
                        request={r}
                        onViewDetails={setSelectedRequest}
                      />
                    ))
                )}
              </Box>
            </Box>

            {/* Finalizadas */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Solicitudes Finalizadas
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {requests.filter((r) => r.status !== "under_review").length ===
                0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No tienes solicitudes finalizadas.
                  </Typography>
                ) : (
                  requests
                    .filter((r) => r.status !== "under_review")
                    .map((r) => (
                      <AdopterRequestCard
                        key={r.id}
                        request={r}
                        onViewDetails={setSelectedRequest}
                      />
                    ))
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PetsIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Detalles de la Solicitud
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedRequest(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Mascota: {selectedRequest.pet.pet.name}
              </Typography>

              <Box sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Fecha de inicio del proceso:</strong>{" "}
                  {new Date(selectedRequest.dateSubmitted).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Última actualización:</strong>{" "}
                  {new Date(selectedRequest.lastUpdate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Estado:</strong>{" "}
                  {selectedRequest.status === "approved"
                    ? "Aprobada"
                    : selectedRequest.status === "rejected"
                    ? "Rechazada"
                    : "En Revisión"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Próximo Paso:</strong> {selectedRequest.nextStep}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                color="primary"
              >
                Mensaje de SmartAdopt
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                {selectedRequest.updateMessage}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              {selectedRequest.status === "approved" ? (
                <Button
                  onClick={handleDownloadCertificate}
                  variant="outlined"
                  color="primary"
                  disabled={isGeneratingPdf}
                  startIcon={
                    isGeneratingPdf ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                >
                  {isGeneratingPdf ? "Generando..." : "Descargar Certificado"}
                </Button>
              ) : (
                <Box />
              )}
              <Button
                onClick={() => setSelectedRequest(null)}
                variant="contained"
                disableElevation
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </AdopterLayout>
  );
};
