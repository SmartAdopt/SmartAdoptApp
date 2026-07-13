// src/pages/admin/AdminPetListPage.tsx

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { petsService } from "../../services/pets.service";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";
import type {
  AIProfileResponse,
  PetUpdatePayload,
} from "../../types/pets.types";

// ==========================================
// HELPER: Derive a display-friendly size label from weight
// ==========================================
const getSizeLabel = (weightKg: number): string => {
  if (weightKg <= 5) return "Pequeño";
  if (weightKg <= 15) return "Mediano";
  return "Grande";
};

// ==========================================
// HELPER: Translate gender for display
// ==========================================
const getGenderLabel = (gender: string): string => {
  return gender === "male" ? "Macho" : "Hembra";
};

// ==========================================
// HELPER: Translate species for display
// ==========================================
const getSpeciesLabel = (animalBreed: string[]): string => {
  if (!animalBreed || animalBreed.length === 0) return "Mascota";
  return animalBreed[0].toLowerCase() === "dog" ? "Perro" : "Gato";
};

// ==========================================
// HELPER: Status badge color and label
// ==========================================
const getStatusConfig = (
  status: string
): { label: string; bgColor: string; textColor: string } => {
  switch (status?.toLowerCase()) {
    case "available":
      return {
        label: "Disponible",
        bgColor: "#22C55E",
        textColor: "#FFFFFF",
      };
    case "in_process":
      return {
        label: "En Proceso",
        bgColor: "#F59E0B",
        textColor: "#FFFFFF",
      };
    case "adopted":
      return {
        label: "Adoptado",
        bgColor: "#6366F1",
        textColor: "#FFFFFF",
      };
    default:
      return {
        label: status || "Sin estado",
        bgColor: "#94A3B8",
        textColor: "#FFFFFF",
      };
  }
};

// ==========================================
// HELPER: Translate vaccine names for display
// ==========================================
const VACCINE_DISPLAY_NAMES: Record<string, string> = {
  rabies: "Rabia",
  parvovirus: "Parvovirus",
  distemper: "Moquillo",
  "infectious hepatitis": "Hepatitis Infecciosa",
  parainfluenza: "Parainfluenza",
  Leptospirosis: "Leptospirosis",
  "Canine Coronavirus": "Coronavirus Canino",
  "feline triple": "Triple Felina",
  "feline leukemia": "Leucemia Felina",
  "feline chlamydiosis": "Clamidiosis Felina",
  "feline infectious peritonitis": "Peritonitis Infecciosa Felina",
};

// ==========================================
// BACKEND-ALLOWED FIELDS REFERENCE
// The PUT /pets/{profile_id} endpoint only accepts these fields:
// Pet fields: age, is_sterilized, vaccines_up_to_date, dewormed,
//             weight_kg, special_conditions, brief_description
// AI fields:  title, tags, emotional_description
//
// Fields NOT allowed by backend: name, animal_breed, pet_image_url, gender
// ==========================================

// ==========================================
// TYPE: Editable field identifiers
// Only fields the backend allows to update
// ==========================================
type EditableField =
  | "title"
  | "name"
  | "biography"
  | "age"
  | "weight"
  | "brief_description"
  | null;

// ==========================================
// COMPONENT: Pet List Sidebar Item
// ==========================================
const PetListItem = ({
  pet,
  isSelected,
  onClick,
}: {
  pet: AIProfileResponse;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <Button
    fullWidth
    onClick={onClick}
    sx={{
      justifyContent: "flex-start",
      textTransform: "none",
      px: 2.5,
      py: 1.5,
      borderRadius: 2,
      fontWeight: isSelected ? 700 : 500,
      fontSize: "0.95rem",
      color: isSelected ? "#FFFFFF" : "#374151",
      bgcolor: isSelected ? "#22C55E" : "transparent",
      border: isSelected ? "none" : "1px solid #E5E7EB",
      mb: 1,
      transition: "all 0.2s ease",
      "&:hover": {
        bgcolor: isSelected ? "#16A34A" : "#F3F4F6",
      },
    }}
  >
    {pet.pet?.name || "Sin nombre"}
  </Button>
);

// ==========================================
// COMPONENT: Section Header with Edit Toggle
// ==========================================
const SectionHeader = ({
  label,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
}: {
  label: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 0.5,
    }}
  >
    <Typography
      variant="caption"
      sx={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    {isEditing ? (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={onSave}
          disabled={isSaving}
          sx={{ color: "#22C55E", minWidth: 48, minHeight: 48 }}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={onCancel}
          disabled={isSaving}
          sx={{ color: "#EF4444", minWidth: 48, minHeight: 48 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    ) : (
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{
          color: "#9CA3AF",
          "&:hover": { color: "#6B7280" },
          minWidth: 48,
          minHeight: 48,
        }}
      >
        <EditIcon sx={{ fontSize: 18 }} />
      </IconButton>
    )}
  </Box>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
export const AdminPetListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State: selected pet
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // State: inline editing
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValues, setEditValues] = useState({
    title: "",
    name: "",
    biography: "",
    age: "",
    weight: "",
    brief_description: "",
  });

  // State: snackbar notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch all pets from the backend
  const {
    data: rawPets,
    isLoading,
    isError,
  } = useQuery<AIProfileResponse[]>({
    queryKey: ["adminRawPets"],
    queryFn: petsService.getRawPetsDatabase,
  });

  // FIX: Auto-select first pet only once when data first arrives.
  // Using a ref prevents re-triggering on every rawPets reference change.
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (rawPets && rawPets.length > 0 && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      setSelectedPetId(rawPets[0].id);
    }
  }, [rawPets]);

  // Mutation for updating pet data
  const updateMutation = useMutation({
    mutationFn: ({
      profileId,
      data,
    }: {
      profileId: string;
      data: Partial<PetUpdatePayload>;
    }) => petsService.updatePet(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRawPets"] });
      setSnackbar({
        open: true,
        message: "¡Perfil actualizado correctamente!",
        severity: "success",
      });
      setEditingField(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Update error:", error?.response?.data || error);
      const detail = error?.response?.data?.detail;
      let errorMsg = "Error al actualizar el perfil. Intenta de nuevo.";
      if (detail) {
        if (typeof detail === "string") {
          errorMsg = detail;
        } else if (detail.message) {
          errorMsg = detail.message;
        }
      }
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    },
  });

  // Mutation for regenerating AI fields
  const regenerateMutation = useMutation({
    mutationFn: (profileId: string) => petsService.regenerateProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRawPets"] });
      setSnackbar({
        open: true,
        message: "¡Textos regenerados exitosamente con IA!",
        severity: "success",
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Regenerate error:", error?.response?.data || error);
      setSnackbar({
        open: true,
        message: "Error al regenerar textos. Intenta de nuevo.",
        severity: "error",
      });
    },
  });

  // Derived: currently selected pet object
  const selectedPet =
    rawPets?.find((p) => p.id === selectedPetId) ?? rawPets?.[0] ?? null;

  // ==========================================
  // EDIT HANDLERS
  // ==========================================
  const startEditing = useCallback(
    (field: EditableField) => {
      if (!selectedPet || !field) return;
      setEditingField(field);
      switch (field) {
        case "title":
          setEditValues((prev) => ({
            ...prev,
            title: selectedPet.title,
          }));
          break;
        case "name":
          setEditValues((prev) => ({
            ...prev,
            name: selectedPet.pet.name,
          }));
          break;
        case "biography":
          setEditValues((prev) => ({
            ...prev,
            biography: selectedPet.emotional_description,
          }));
          break;
        case "age":
          setEditValues((prev) => ({
            ...prev,
            age: String(selectedPet.pet.age),
          }));
          break;
        case "weight":
          setEditValues((prev) => ({
            ...prev,
            weight: String(selectedPet.pet.weight_kg),
          }));
          break;
        case "brief_description":
          setEditValues((prev) => ({
            ...prev,
            brief_description: selectedPet.pet.brief_description,
          }));
          break;
      }
    },
    [selectedPet]
  );

  const cancelEditing = useCallback(() => {
    setEditingField(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (!selectedPet || !editingField) return;

    let payload: Partial<PetUpdatePayload> = {};

    switch (editingField) {
      case "title":
        if (!editValues.title.trim()) return;
        payload = { title: editValues.title.trim() };
        break;
      case "name":
        if (!editValues.name.trim()) return;
        payload = { name: editValues.name.trim() };
        break;
      case "biography":
        if (!editValues.biography.trim()) return;
        payload = { emotional_description: editValues.biography.trim() };
        break;
      case "age": {
        const ageNum = Number(editValues.age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 20) {
          setSnackbar({
            open: true,
            message: "La edad debe ser un número entre 0 y 20.",
            severity: "error",
          });
          return;
        }
        payload = { age: ageNum };
        break;
      }
      case "weight": {
        const weightNum = Number(editValues.weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 45) {
          setSnackbar({
            open: true,
            message: "El peso debe ser un número entre 0.1 y 45 kg.",
            severity: "error",
          });
          return;
        }
        payload = { weight_kg: weightNum };
        break;
      }
      case "brief_description":
        if (!editValues.brief_description.trim()) return;
        payload = { brief_description: editValues.brief_description.trim() };
        break;
    }

    updateMutation.mutate({ profileId: selectedPet.id, data: payload });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPet, editingField, editValues]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <AdminLayout>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/dashboard")}
          sx={{ mb: 1, color: "text.secondary", textTransform: "none" }}
        >
          Volver al Dashboard
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Vista Previa Interactiva & Edición
        </Typography>
        <Typography color="text.secondary">
          Previsualiza y edita perfiles de mascotas tal como los ven los
          adoptantes
        </Typography>
      </Box>

      {/* LOADING / ERROR STATES */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Typography color="error" sx={{ py: 4 }}>
          Error cargando registros del servidor.
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && (!rawPets || rawPets.length === 0) && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay mascotas registradas todavía
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Haz clic en "Añadir Mascota" para registrar la primera.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/pets/new")}
          >
            Añadir Mascota
          </Button>
        </Box>
      )}

      {/* MAIN SPLIT-PANEL LAYOUT */}
      {rawPets && rawPets.length > 0 && selectedPet && selectedPet.pet && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* ==========================================
              LEFT PANEL: Pet List Sidebar
              ========================================== */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 260 },
              minWidth: { xs: "100%", md: 260 },
              p: 3,
              borderRadius: 3,
              border: "1px solid #E5E7EB",
              position: { xs: "static", md: "sticky" },
              top: 24,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 2, color: "#374151" }}
            >
              Seleccionar Mascota
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {rawPets.map((pet) => (
                <PetListItem
                  key={pet.id}
                  pet={pet}
                  isSelected={pet.id === selectedPet.id}
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    setEditingField(null);
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* ==========================================
              RIGHT PANEL: Pet Profile Preview & Edit
              ========================================== */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Hot Editing Mode Banner */}
            <Box
              sx={{
                bgcolor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 2,
                px: 2.5,
                py: 1.5,
                mb: 2.5,
              }}
            >
              <Typography variant="body2" sx={{ color: "#166534" }}>
                <strong>Modo Edición Rápida:</strong> Haz clic en cualquier
                campo para editarlo en línea. Esta vista previa muestra
                exactamente lo que verán los adoptantes.
              </Typography>
            </Box>

            {/* Profile Card */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                overflow: "hidden",
              }}
            >
              {/* Pet Image with Status Badge */}
              <Box sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={selectedPet.pet.pet_image_url}
                  alt={selectedPet.pet.name}
                  sx={{
                    width: "100%",
                    height: { xs: 240, md: 340 },
                    objectFit: "cover",
                    display: "block",
                    bgcolor: "#F3F4F6",
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = PUBLIC_ASSETS.dog;
                  }}
                />
                {/* Status Badge */}
                {(() => {
                  const statusConfig = getStatusConfig(selectedPet.status);
                  return (
                    <Chip
                      label={statusConfig.label}
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        bgcolor: statusConfig.bgColor,
                        color: statusConfig.textColor,
                        height: 32,
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                  );
                })()}
              </Box>

              {/* Profile Content */}
              <Box sx={{ p: 3.5 }}>
                {/* ---- NAME SECTION ---- */}
                <SectionHeader
                  label="Nombre de la Mascota"
                  isEditing={editingField === "name"}
                  isSaving={updateMutation.isPending}
                  onEdit={() => startEditing("name")}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                />
                {editingField === "name" ? (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Nombre"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      autoFocus
                      disabled={updateMutation.isPending}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ mb: 2, color: "#1F2937" }}
                  >
                    {selectedPet.pet?.name || "Sin nombre"}
                  </Typography>
                )}

                {/* ---- AGE SECTION ---- */}
                <SectionHeader
                  label="Edad (Años)"
                  isEditing={editingField === "age"}
                  isSaving={updateMutation.isPending}
                  onEdit={() => startEditing("age")}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                />
                {editingField === "age" ? (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Edad"
                      type="number"
                      value={editValues.age}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      autoFocus
                      disabled={updateMutation.isPending}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#4B5563" }}
                  >
                    {selectedPet.pet.age} años
                  </Typography>
                )}

                {/* ---- REGENERATE AI CONTENT ---- */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#F3E8FF",
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    border: "1px dashed #D8B4FE",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6B21A8" }}>
                    <strong>¿Cambiaste los datos?</strong> Regenera el título,
                    la biografía y las etiquetas basándose en la información
                    actual.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      regenerateMutation.isPending ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AutoAwesomeIcon />
                      )
                    }
                    onClick={() => regenerateMutation.mutate(selectedPet.id)}
                    disabled={
                      regenerateMutation.isPending || updateMutation.isPending
                    }
                    sx={{
                      bgcolor: "#9333EA",
                      "&:hover": { bgcolor: "#7E22CE" },
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {regenerateMutation.isPending
                      ? "Generando..."
                      : "Regenerar Textos con IA"}
                  </Button>
                </Box>

                {/* ---- AI TITLE SECTION ---- */}
                <SectionHeader
                  label="Título del Perfil"
                  isEditing={editingField === "title"}
                  isSaving={updateMutation.isPending}
                  onEdit={() => startEditing("title")}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                />
                {editingField === "title" ? (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Título del perfil"
                      value={editValues.title}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      autoFocus
                      disabled={updateMutation.isPending}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ mb: 3, color: "#9CA3AF", fontStyle: "italic" }}
                  >
                    {selectedPet.title}
                  </Typography>
                )}

                <Divider sx={{ mb: 3, borderColor: "#F3F4F6" }} />

                {/* ---- BREED SECTION (read-only — backend does not allow breed updates) ---- */}
                <Box sx={{ mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9CA3AF",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    Raza
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ mb: 1.5, color: "#374151" }}
                >
                  {selectedPet.pet.animal_breed &&
                  selectedPet.pet.animal_breed.length > 1
                    ? selectedPet.pet.animal_breed.slice(1).join(", ")
                    : "Sin raza especificada"}
                </Typography>
                {/* Species / Size / Gender tags */}
                <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                  <Chip
                    label={getSpeciesLabel(selectedPet.pet.animal_breed || [])}
                    size="small"
                    sx={{
                      bgcolor: "#22C55E",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                    }}
                  />
                  <Chip
                    label={getSizeLabel(selectedPet.pet.weight_kg)}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "#D1D5DB",
                      color: "#6B7280",
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    label={getGenderLabel(selectedPet.pet.gender)}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "#D1D5DB",
                      color: "#6B7280",
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3, borderColor: "#F3F4F6" }} />

                {/* ---- BIOGRAPHY SECTION (emotional_description — editable) ---- */}
                <SectionHeader
                  label="Biografía"
                  isEditing={editingField === "biography"}
                  isSaving={updateMutation.isPending}
                  onEdit={() => startEditing("biography")}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                />
                {editingField === "biography" ? (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={4}
                      value={editValues.biography}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          biography: e.target.value,
                        }))
                      }
                      autoFocus
                      disabled={updateMutation.isPending}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      color: "#4B5563",
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedPet.emotional_description}
                  </Typography>
                )}

                <Divider sx={{ mb: 3, borderColor: "#F3F4F6" }} />

                {/* ---- TEMPERAMENT SECTION (from tags) ---- */}
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ mb: 1.5, color: "#374151" }}
                >
                  Temperamento
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                  {(selectedPet.tags || []).map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#065F46",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        border: "1px solid #A7F3D0",
                      }}
                    />
                  ))}
                </Box>

                <Divider sx={{ mb: 3, borderColor: "#F3F4F6" }} />

                {/* ---- MEDICAL HISTORY SECTION ---- */}
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ mb: 1.5, color: "#374151" }}
                >
                  Historial Médico
                </Typography>
                <Box
                  sx={{
                    bgcolor: "#F9FAFB",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                    mb: 3,
                  }}
                >
                  {/* Vaccinated */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      Vacunado:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          selectedPet.pet.vaccines_up_to_date &&
                          selectedPet.pet.vaccines_up_to_date.length > 0
                            ? "#22C55E"
                            : "#EF4444",
                        fontWeight: 600,
                      }}
                    >
                      {selectedPet.pet.vaccines_up_to_date &&
                      selectedPet.pet.vaccines_up_to_date.length > 0
                        ? "Sí"
                        : "No"}
                    </Typography>
                  </Box>

                  {/* Sterilized */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      Esterilizado/Castrado:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedPet.pet.is_sterilized
                          ? "#22C55E"
                          : "#EF4444",
                        fontWeight: 600,
                      }}
                    >
                      {selectedPet.pet.is_sterilized ? "Sí" : "No"}
                    </Typography>
                  </Box>

                  {/* Dewormed */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      Desparasitado:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedPet.pet.dewormed ? "#22C55E" : "#EF4444",
                        fontWeight: 600,
                      }}
                    >
                      {selectedPet.pet.dewormed ? "Sí" : "No"}
                    </Typography>
                  </Box>

                  {/* Vaccines list */}
                  {selectedPet.pet.vaccines_up_to_date &&
                    selectedPet.pet.vaccines_up_to_date.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          px: 2.5,
                          py: 1.5,
                          borderBottom: "1px solid #E5E7EB",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#374151" }}>
                          Vacunas:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                            maxWidth: "60%",
                          }}
                        >
                          {selectedPet.pet.vaccines_up_to_date.map(
                            (vaccine, idx) => (
                              <Chip
                                key={idx}
                                label={
                                  VACCINE_DISPLAY_NAMES[vaccine] || vaccine
                                }
                                size="small"
                                sx={{
                                  bgcolor: "#EFF6FF",
                                  color: "#1D4ED8",
                                  fontWeight: 500,
                                  fontSize: "0.72rem",
                                  height: 24,
                                }}
                              />
                            )
                          )}
                        </Box>
                      </Box>
                    )}

                  {/* Special conditions */}
                  {selectedPet.pet.special_conditions &&
                    selectedPet.pet.special_conditions.length > 0 &&
                    selectedPet.pet.special_conditions[0] !== "none" && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          px: 2.5,
                          py: 1.5,
                          borderBottom: "1px solid #E5E7EB",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#374151" }}>
                          Condiciones Especiales:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#F59E0B", fontWeight: 600 }}
                        >
                          {selectedPet.pet.special_conditions.join(", ")}
                        </Typography>
                      </Box>
                    )}

                  {/* Weight */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      Peso:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#6B7280", fontWeight: 600 }}
                    >
                      {selectedPet.pet.weight_kg} kg
                    </Typography>
                  </Box>

                  {/* Creation date */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      Último Chequeo:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#6B7280", fontWeight: 600 }}
                    >
                      {new Date(selectedPet.creation_date).toLocaleDateString(
                        "es-EC",
                        {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        }
                      )}
                    </Typography>
                  </Box>
                </Box>

                {/* ---- ADOPTER VIEW NOTE ---- */}
                <Box
                  sx={{
                    bgcolor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#1E40AF" }}>
                    <strong>Vista del Adoptante:</strong> Así es exactamente
                    como aparece el perfil de esta mascota para los adoptantes
                    potenciales en el feed de exploración.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};
