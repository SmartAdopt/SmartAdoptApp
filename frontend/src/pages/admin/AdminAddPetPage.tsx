// src/pages/admin/AdminAddPetPage.tsx

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { usePetDatabase } from "../../context/PetContext";

// ==========================================
// 1. ZOD SCHEMA: Strict form validation
// APPLIED FIX: Compatible enums and direct booleans
// ==========================================
const addPetSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  raza: z.string().min(2, "La raza es requerida"),
  edad: z.string().min(1, "Especifica la edad (Ej: 3 años)"),

  genero: z.enum(["Macho", "Hembra"], {
    message: "Selecciona un género",
  }),

  ubicacion: z.string().min(3, "La ubicación es requerida"),
  peso: z.string().optional(),
  esterilizado: z.boolean(),
  vacunado: z.boolean(),
  biografia: z.string().min(10, "Añade una breve descripción").optional(),
});

type AddPetFormData = z.infer<typeof addPetSchema>;

export const AdminAddPetPage = () => {
  const navigate = useNavigate();
  const { addPet } = usePetDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPetFormData>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      nombre: "",
      raza: "",
      edad: "",
      genero: "Macho", // <-- Default value is defined here
      ubicacion: "Quito, Refugio Principal",
      peso: "",
      esterilizado: false, // <-- Default value is defined here
      vacunado: false, // <-- Default value is defined here
      biografia: "",
    },
  });

  const onSubmit = (data: AddPetFormData) => {
    setIsSubmitting(true);

    setTimeout(() => {
      // Adapt the form to the global data model
      addPet({
        nombre: data.nombre,
        raza: data.raza,
        edad: data.edad,
        genero: data.genero,
        ubicacion: data.ubicacion,
        peso: data.peso,
        esterilizado: data.esterilizado,
        vacunado: data.vacunado,
        biografia: data.biografia,
        imagen: data.genero === "Macho" ? "/dog.svg" : "/cat.svg",
      });

      setIsSubmitting(false);
      navigate("/admin/dashboard");
    }, 1000);
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
        >
          Volver al Dashboard
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Añadir Nueva Mascota
        </Typography>
        <Typography color="text.secondary">
          Sube y crea perfiles de mascotas con asistencia de IA.
        </Typography>
      </Box>

      {/* FORM CARD */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "grey.200",
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {/* DRAG & DROP IMAGE PLACEHOLDER (Visual) */}
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Foto de la Mascota *
        </Typography>
        <Box
          sx={{
            border: "2px dashed",
            borderColor: "grey.300",
            borderRadius: 3,
            p: 6,
            textAlign: "center",
            mb: 4,
            bgcolor: "grey.50",
            cursor: "pointer",
            "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
          <Typography variant="body1" fontWeight={600} gutterBottom>
            Arrastra y suelta la imagen aquí
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            o
          </Typography>
          <Button variant="outlined" color="inherit" sx={{ bgcolor: "white" }}>
            Explorar Archivos
          </Button>
        </Box>

        {/* FORM FIELDS */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre de la Mascota *"
                    fullWidth
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="raza"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Raza *"
                    fullWidth
                    error={!!errors.raza}
                    helperText={errors.raza?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="edad"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Edad *"
                    placeholder="Ej: 3 años"
                    fullWidth
                    error={!!errors.edad}
                    helperText={errors.edad?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="genero"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Género *"
                    fullWidth
                    error={!!errors.genero}
                    helperText={errors.genero?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  >
                    <MenuItem value="Macho">Macho</MenuItem>
                    <MenuItem value="Hembra">Hembra</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="peso"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Peso"
                    placeholder="Ej: 15 kg"
                    fullWidth
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="ubicacion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ubicación *"
                    fullWidth
                    error={!!errors.ubicacion}
                    helperText={errors.ubicacion?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>

            {/* BIOGRAPHY & AI */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  mt: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Biografía
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<AutoAwesomeIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Generar con IA
                </Button>
              </Box>
              <Controller
                name="biografia"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Escribe o genera una biografía atractiva..."
                    error={!!errors.biografia}
                    helperText={errors.biografia?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>

            {/* MEDICAL HISTORY */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "info.50",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "info.100",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  gutterBottom
                  color="info.900"
                >
                  Historial Médico
                </Typography>
                <Controller
                  name="vacunado"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="info"
                        />
                      }
                      label={
                        <Typography variant="body2" color="info.900">
                          Vacunas al día
                        </Typography>
                      }
                      sx={{ display: "block" }}
                    />
                  )}
                />
                <Controller
                  name="esterilizado"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="info"
                        />
                      }
                      label={
                        <Typography variant="body2" color="info.900">
                          Esterilizado / Castrado
                        </Typography>
                      }
                      sx={{ display: "block" }}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={isSubmitting}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                >
                  {isSubmitting
                    ? "Publicando..."
                    : "Publicar Perfil de Mascota"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </AdminLayout>
  );
};
