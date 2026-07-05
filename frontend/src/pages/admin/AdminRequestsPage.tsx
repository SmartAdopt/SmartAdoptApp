// src/pages/admin/AdminRequestsPage.tsx

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
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  PersonOutline as PersonOutlineIcon,
} from "@mui/icons-material";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { adoptionRequestsService } from "../../services/adoptionRequests.service";
import type { AdoptionRequest } from "../../types/adoption.types";
import type { AIProfileResponse } from "../../types/pets.types";

type RequestWithPet = AdoptionRequest & { pet: AIProfileResponse };

export const AdminRequestsPage = () => {
  const [requests, setRequests] = useState<RequestWithPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "under_review" | "approved">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

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

  // Stats
  const pendingCount = requests.filter(
    (r) => r.status === "under_review",
  ).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const totalCount = requests.length;

  // Derived filtered list
  const filteredRequests = requests.filter((req) => {
    // Filter by status
    if (filter !== "all" && req.status !== filter) return false;

    // Search by pet name
    if (searchQuery) {
      const petName = req.pet.pet.name.toLowerCase();
      return petName.includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Gestión de Solicitudes
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Revisa y administra todas las solicitudes de adopción
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
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
                bgcolor: "grey.50",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "text.secondary",
              }}
            >
              <AccessTimeIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
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
        <Grid item xs={12} sm={3}>
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
        <Grid item xs={12} sm={3}>
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
                bgcolor: "secondary.50",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                color: "secondary.main",
              }}
            >
              <GroupsOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {totalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Solicitudes
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <TextField
          variant="outlined"
          placeholder="Buscar por nombre de mascota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, bgcolor: "background.paper" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            bgcolor: "grey.100",
            p: 0.5,
            borderRadius: 2,
          }}
        >
          <Button
            variant={filter === "all" ? "contained" : "text"}
            color="primary"
            onClick={() => setFilter("all")}
            sx={{ borderRadius: 2, px: 3 }}
            disableElevation
          >
            Todas
          </Button>
          <Button
            variant={filter === "under_review" ? "contained" : "text"}
            color="inherit"
            startIcon={<FilterListIcon />}
            onClick={() => setFilter("under_review")}
            sx={{
              borderRadius: 2,
              px: 3,
              bgcolor: filter === "under_review" ? "white" : "transparent",
            }}
            disableElevation
          >
            Pendientes
          </Button>
          <Button
            variant={filter === "approved" ? "contained" : "text"}
            color="inherit"
            onClick={() => setFilter("approved")}
            sx={{
              borderRadius: 2,
              px: 3,
              bgcolor: filter === "approved" ? "white" : "transparent",
            }}
            disableElevation
          >
            Aprobadas
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Left: Requests List */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Solicitudes ({filteredRequests.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No se encontraron solicitudes.
              </Typography>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequestId === req.id;
                const isApproved = req.status === "approved";
                const statusLabel = isApproved ? "Aprobada" : "Pendiente";
                const statusColor = isApproved ? "success" : "primary";

                return (
                  <Card
                    key={req.id}
                    elevation={0}
                    onClick={() => setSelectedRequestId(req.id)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "2px solid",
                      borderColor: isSelected ? "primary.main" : "grey.200",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: isSelected ? "primary.main" : "grey.300",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Adoptante Anónimo
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          para {req.pet.pet.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={statusLabel}
                        size="small"
                        color={statusColor}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 3,
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Progreso
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(req.dateSubmitted).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={req.progressPercentage}
                      color={statusColor}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Card>
                );
              })
            )}
          </Box>
        </Grid>

        {/* Right: Request Details */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              minHeight: 500,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              alignItems: selectedRequest ? "flex-start" : "center",
              justifyContent: selectedRequest ? "flex-start" : "center",
              p: selectedRequest ? 4 : 0,
            }}
          >
            {!selectedRequest ? (
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <PersonOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  Selecciona una Solicitud
                </Typography>
                <Typography variant="body2">
                  Elige una solicitud de la lista para ver los detalles y tomar
                  acción.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: "100%" }}>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  Detalles de la Solicitud
                </Typography>

                <Grid container spacing={4} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Mascota Solicitada
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          selectedRequest.pet.pet.pet_image_url || "/dog.svg"
                        }
                        alt={selectedRequest.pet.pet.name}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                        onError={(e) => (e.currentTarget.src = "/dog.svg")}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {selectedRequest.pet.pet.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {selectedRequest.pet.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Fecha de Envío
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 3 }}>
                      {new Date(
                        selectedRequest.dateSubmitted,
                      ).toLocaleDateString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Estado Actual
                    </Typography>
                    <Chip
                      label={
                        selectedRequest.status === "approved"
                          ? "Aprobada"
                          : "En Revisión"
                      }
                      color={
                        selectedRequest.status === "approved"
                          ? "success"
                          : "primary"
                      }
                      sx={{ fontWeight: 600, borderRadius: 2, mb: 3 }}
                    />

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Próximo Paso
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 3 }}>
                      {selectedRequest.nextStep}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Mensaje de Actualización (Visible para el adoptante)
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.200",
                    mb: 4,
                  }}
                >
                  <Typography variant="body2">
                    {selectedRequest.updateMessage}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button variant="outlined" color="error">
                    Rechazar
                  </Button>
                  <Button variant="contained" color="success">
                    Aprobar Adopción
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};
