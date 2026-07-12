// src/pages/admin/AdminRequestsPage.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  Search as SearchIcon,
  PersonOutline as PersonOutlineIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { adoptionFormService } from "../../services/adoptionForm.service";
import { petsService } from "../../services/pets.service";
import type { AdminBreakdownItem } from "../../services/adoptionForm.service";
import { translateBreakdownItem } from "../../services/adoptionForm.service";
import type { AIProfileResponse } from "../../types/pets.types";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

interface FlatAppItem {
  applicationId: string;
  petProfileId: string;
  petName?: string;
  adopterName?: string;
  status: string;
  totalScore: number;
  totalMaxScore: number;
  aiBreakdown?: AdminBreakdownItem[];
  aiJustification?: string;
  createdAt: string;
  needsManualReview: boolean;
  reviewedBy?: number;
  reviewedAt?: string;
  formId: string;
  userId: number;
}

export const AdminRequestsPage = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<FlatAppItem[]>([]);
  const [allApps, setAllApps] = useState<FlatAppItem[]>([]);
  const [pets, setPets] = useState<AIProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterName, setFilterName] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const selectedApp = apps.find((a) => a.applicationId === selectedAppId);
  const selectedPet = selectedApp
    ? pets.find((p) => p.id === selectedApp.petProfileId)
    : undefined;

  const fetchData = useCallback(
    async (status?: string, petName?: string) => {
      setIsLoading(true);
      try {
        const [formData, allPets] = await Promise.all([
          adoptionFormService.getAdminForms(status, petName),
          petsService.getRawPetsDatabase(),
        ]);
        const flattened: FlatAppItem[] = [];
        for (const form of formData.forms) {
          for (const app of form.applications) {
            flattened.push({
              applicationId: app.application_id,
              petProfileId: app.pet_profile_id,
              petName: app.pet_name,
              adopterName: app.adopter_name,
              status: app.status,
              totalScore: app.total_score,
              totalMaxScore: app.total_max_score,
              aiBreakdown: app.ai_breakdown
                ? app.ai_breakdown.map(translateBreakdownItem)
                : undefined,
              aiJustification: app.ai_justification,
              createdAt: app.created_at,
              needsManualReview: app.needs_manual_review,
              reviewedBy: app.reviewed_by,
              reviewedAt: app.reviewed_at,
              formId: form.form_id,
              userId: form.user_id,
            });
          }
        }
        if (!status && !petName) {
          setAllApps(flattened);
          setApps(flattened);
        } else {
          setApps(flattened);
        }
        setPets(allPets);
        if (
          selectedAppId &&
          !flattened.find((a) => a.applicationId === selectedAppId)
        ) {
          setSelectedAppId(null);
        }
      } catch (error: unknown) {
        const status = error instanceof Error ? "error" : "unknown";
        if (status === "error") {
          setApps([]);
        } else {
          console.error("Failed to load data", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAppId]
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, [fetchData]);

  const handleSearch = () => {
    fetchData(filterStatus || undefined, filterName || undefined);
  };

  const handleClearFilter = () => {
    setFilterStatus("");
    setFilterName("");
    fetchData();
  };

  const handleAction = async (newStatus: "approved" | "rejected") => {
    if (!selectedAppId) return;
    setIsUpdating(true);
    try {
      await adoptionFormService.reviewApplication(selectedAppId, newStatus);
      await fetchData(filterStatus || undefined, filterName || undefined);
    } catch (error) {
      console.error("Error updating application", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!selectedApp || !selectedPet) return;
    setIsGeneratingPdf(true);
    try {
      const { generateCertificate } = await import(
        "../../utils/certificateGenerator"
      );
      const adoptionRequest = {
        id: selectedApp.applicationId,
        petId: selectedApp.petProfileId,
        status: selectedApp.status as "under_review" | "approved" | "rejected",
        dateSubmitted: selectedApp.createdAt,
        lastUpdate: selectedApp.createdAt,
        progressPercentage: 100,
        updateMessage: "",
        nextStep: "Finalizada",
        adopterName: selectedApp.adopterName,
      };
      await generateCertificate(adoptionRequest, selectedPet);
    } catch (error) {
      console.error("Failed to generate certificate", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const pendingCount = allApps.filter((a) => a.status === "pending").length;
  const approvedCount = allApps.filter((a) => a.status === "approved").length;
  const rejectedCount = allApps.filter((a) => a.status === "rejected").length;
  const totalCount = allApps.length;

  const getStatusProps = (status: string) => {
    if (status === "approved")
      return { label: "Aprobada", color: "success" as const };
    if (status === "rejected")
      return { label: "Rechazada", color: "error" as const };
    return { label: "Pendiente", color: "primary" as const };
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = max > 0 ? score / max : 0;
    if (pct >= 0.7) return "success.main";
    if (pct >= 0.4) return "warning.main";
    return "error.main";
  };

  const getImageUrl = (petProfileId: string) => {
    const pet = pets.find((p) => p.id === petProfileId);
    return pet?.pet?.pet_image_url || PUBLIC_ASSETS.dog;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

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
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/dashboard")}
          sx={{ color: "text.secondary", textTransform: "none" }}
        >
          Volver al Dashboard
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Gestión de Solicitudes
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Revisa y administra todas las solicitudes de adopción
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            value: pendingCount,
            label: "Pendientes",
            icon: <AccessTimeIcon />,
            bg: "#FEFCE8",
            color: "warning.main",
          },
          {
            value: approvedCount,
            label: "Aprobadas",
            icon: <CheckCircleOutlineIcon />,
            bg: "#F0FDF4",
            color: "success.main",
          },
          {
            value: rejectedCount,
            label: "Rechazadas",
            icon: <CancelOutlinedIcon />,
            bg: "#FEF2F2",
            color: "error.main",
          },
          {
            value: totalCount,
            label: "Total Solicitudes",
            icon: <GroupsOutlinedIcon />,
            bg: "#EFF6FF",
            color: "primary.main",
          },
        ].map((stat) => (
          <Grid item xs={6} sm={3} key={stat.label}>
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
                  bgcolor: stat.bg,
                  p: 1.5,
                  borderRadius: "50%",
                  display: "flex",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Creative Filter */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "#FAFAFA",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <FilterListIcon fontSize="small" color="action" />
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.secondary"
          >
            Filtrar Solicitudes
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterStatus}
              label="Estado"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">Todos los estados</MenuItem>
              <MenuItem value="pending">Pendientes</MenuItem>
              <MenuItem value="approved">Aprobadas</MenuItem>
              <MenuItem value="rejected">Rechazadas</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            variant="outlined"
            placeholder="Buscar por nombre de mascota..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200, bgcolor: "background.paper" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{ borderRadius: 2, px: 3, whiteSpace: "nowrap" }}
          >
            Buscar
          </Button>

          {(filterStatus || filterName) && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClearFilter}
              startIcon={<ClearIcon />}
              sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left: List */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Solicitudes ({apps.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {apps.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No se encontraron solicitudes.
              </Typography>
            ) : (
              apps.map((app) => {
                const sp = getStatusProps(app.status);
                const isSelected = selectedAppId === app.applicationId;
                return (
                  <Card
                    key={app.applicationId}
                    elevation={0}
                    onClick={() => {
                      setSelectedAppId(app.applicationId);
                      setShowFullDetails(false);
                    }}
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
                          {app.adopterName || `Adoptante #${app.userId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          para {app.petName || "Mascota desconocida"}
                        </Typography>
                      </Box>
                      <Chip
                        label={sp.label}
                        size="small"
                        color={sp.color}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Score: {app.totalScore}/{app.totalMaxScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(app.createdAt)}
                      </Typography>
                    </Box>
                  </Card>
                );
              })
            )}
          </Box>
        </Grid>

        {/* Right: Detail */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              minHeight: 500,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              alignItems: selectedApp ? "flex-start" : "center",
              justifyContent: selectedApp ? "flex-start" : "center",
              p: selectedApp ? 4 : 0,
              overflow: "auto",
            }}
          >
            {!selectedApp ? (
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

                {/* Pet Info + Adopter */}
                <Grid container spacing={3} sx={{ mt: 1 }}>
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
                        mb: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(selectedApp.petProfileId)}
                        alt={selectedApp.petName || "Mascota"}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                        onError={(e) =>
                          (e.currentTarget.src = PUBLIC_ASSETS.dog)
                        }
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {selectedApp.petName || "Desconocida"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {selectedApp.petProfileId}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Adoptante
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {selectedApp.adopterName ||
                        `Usuario #${selectedApp.userId}`}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Fecha de Envío
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {formatDate(selectedApp.createdAt)}
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
                      label={getStatusProps(selectedApp.status).label}
                      color={getStatusProps(selectedApp.status).color}
                      sx={{ fontWeight: 600, borderRadius: 2, mb: 3 }}
                    />
                    {selectedApp.reviewedAt && (
                      <>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Revisada el
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          sx={{ mb: 3 }}
                        >
                          {formatDate(selectedApp.reviewedAt)}
                        </Typography>
                      </>
                    )}
                    {selectedApp.needsManualReview && (
                      <Chip
                        label="Requiere revisión manual"
                        color="warning"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Score Summary */}
                <Box
                  sx={{
                    p: 3,
                    bgcolor: "#FAF5FF",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "secondary.200",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Box sx={{ textAlign: "center", minWidth: 100 }}>
                    <Typography
                      variant="h3"
                      fontWeight={800}
                      sx={{
                        color: getScoreColor(
                          selectedApp.totalScore,
                          selectedApp.totalMaxScore
                        ),
                      }}
                    >
                      {selectedApp.totalScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      de {selectedApp.totalMaxScore}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Puntuación Final
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedApp.totalScore >= selectedApp.totalMaxScore * 0.7
                        ? "Recomendación: Aprobado — el perfil del adoptante es compatible."
                        : selectedApp.totalScore >=
                          selectedApp.totalMaxScore * 0.4
                        ? "Recomendación: Revisión requerida — compatibilidad media."
                        : "Recomendación: No recomendado — baja compatibilidad."}
                    </Typography>
                    {selectedApp.needsManualReview && (
                      <Typography
                        variant="body2"
                        color="warning.main"
                        sx={{ mt: 1 }}
                      >
                        Evaluación IA no disponible, requiere revisión manual
                        completa.
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Toggle button for full details */}
                {(selectedApp.aiBreakdown?.length ?? 0) > 0 ||
                selectedApp.aiJustification ? (
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setShowFullDetails((prev) => !prev)}
                      endIcon={
                        showFullDetails ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      {showFullDetails
                        ? "Ver menos detalles"
                        : "Ver más detalles"}
                    </Button>
                    {!showFullDetails && selectedApp.aiJustification && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 1,
                          maxWidth: 600,
                          mx: "auto",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedApp.aiJustification}
                      </Typography>
                    )}
                  </Box>
                ) : null}

                <Collapse in={showFullDetails}>
                  {/* AI Breakdown Table */}
                  {selectedApp.aiBreakdown &&
                    selectedApp.aiBreakdown.length > 0 && (
                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{ mb: 3, borderRadius: 2 }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>
                                Campo
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>
                                Respuesta
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 700 }}
                                align="center"
                              >
                                Pts
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>
                                Evaluación IA
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedApp.aiBreakdown.map((item, i) => (
                              <TableRow key={`${item.field}-${i}`}>
                                <TableCell
                                  sx={{ fontWeight: 500, whiteSpace: "nowrap" }}
                                >
                                  {item.label}
                                </TableCell>
                                <TableCell>{item.answer}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={`${item.points}/${item.max_points}`}
                                    size="small"
                                    color={
                                      item.points > 0 ? "success" : "error"
                                    }
                                    sx={{ fontWeight: 600, minWidth: 48 }}
                                  />
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {item.evaluation}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                  {/* AI Justification */}
                  {selectedApp.aiJustification && (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <AutoAwesomeIcon color="secondary" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          Justificación de la IA
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                          mb: 3,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                        >
                          {selectedApp.aiJustification}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Collapse>

                {/* Actions */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  {selectedApp.status === "approved" ? (
                    <Button
                      onClick={handleDownloadCertificate}
                      variant="outlined"
                      color="primary"
                      disabled={isGeneratingPdf || !selectedPet}
                      startIcon={
                        isGeneratingPdf ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DownloadIcon />
                        )
                      }
                    >
                      {isGeneratingPdf
                        ? "Generando..."
                        : "Descargar Certificado"}
                    </Button>
                  ) : (
                    <Box />
                  )}

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleAction("rejected")}
                      disabled={isUpdating || selectedApp.status !== "pending"}
                    >
                      Rechazar
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAction("approved")}
                      disabled={isUpdating || selectedApp.status !== "pending"}
                    >
                      {isUpdating ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Aprobar Adopción"
                      )}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* AI Justification Modal */}
      {selectedApp?.aiJustification && (
        <Dialog
          open={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon color="secondary" />
            Evaluación de Llama 3
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {selectedApp.aiJustification}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAiModalOpen(false)} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AdminLayout>
  );
};
