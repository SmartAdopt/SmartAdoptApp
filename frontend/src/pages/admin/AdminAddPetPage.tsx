// src/pages/admin/AdminAddPetPage.tsx

import { useState, useEffect } from "react";
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
  FormGroup,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { useRef } from "react";
import { petsService } from "../../services/pets.service";
import { adaptPetFormToBackend } from "../../utils/pets.adapters";

// ==========================================
// CONSTANTS: Backend exact matches mapping
// ==========================================
const DOG_VACCINES = [
  "rabies",
  "parvovirus",
  "distemper",
  "infectious hepatitis",
  "parainfluenza",
  "Leptospirosis",
  "Canine Coronavirus",
];

const CAT_VACCINES = [
  "rabies",
  "feline triple",
  "feline leukemia",
  "feline chlamydiosis",
  "feline infectious peritonitis",
];

// UI labels mapped to backend English values
const VACCINE_LABELS: Record<string, string> = {
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
// ZOD SCHEMA: Strict form validation aligning with FastAPI
// Removed .coerce and .default() to satisfy TypeScript strict mode
// ==========================================
const addPetSchema = z.object({
  especie: z.enum(["Perro", "Gato"], { message: "Selecciona la especie" }),
  nombre: z.string().min(2, "El nombre es muy corto"),
  raza: z.string().min(2, "La raza es requerida"),
  edad: z
    .number({ message: "Debes ingresar una edad válida" })
    .min(0, "Mínimo 0")
    .max(20, "El límite del sistema es 20 años"),
  peso: z
    .number({ message: "Debes ingresar un peso válido" })
    .min(0.1, "Peso inválido")
    .max(45, "El límite del sistema es 45 kg"),
  genero: z.enum(["Macho", "Hembra"], { message: "Selecciona un género" }),
  ubicacion: z.string().min(3, "La ubicación es requerida"),
  esterilizado: z.boolean(),
  desparasitado: z.boolean(),
  vacunas: z.array(z.string()),
  condicionesEspeciales: z.string().optional(),
  biografia: z.string().min(10, "Añade una breve descripción para la IA"),
});

type AddPetFormData = z.infer<typeof addPetSchema>;

export const AdminAddPetPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddPetFormData>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      especie: "Perro",
      nombre: "",
      raza: "",
      edad: "" as unknown as number, // Safe cast to prevent zero-filled inputs
      peso: "" as unknown as number, // Safe cast to prevent zero-filled inputs
      genero: "Macho",
      ubicacion: "Quito, Refugio Principal",
      esterilizado: false,
      desparasitado: false,
      vacunas: [],
      condicionesEspeciales: "",
      biografia: "",
    },
  });

  // Watch the species to dynamically render the correct vaccines
  const selectedSpecies = useWatch({ control, name: "especie" });
  const availableVaccines =
    selectedSpecies === "Perro" ? DOG_VACCINES : CAT_VACCINES;

  // Clean vaccines array if the user changes the species midway
  useEffect(() => {
    setValue("vacunas", []);
  }, [selectedSpecies, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Creates a local preview
    }
  };

  const onSubmit = async (data: AddPetFormData) => {
    if (!imageFile) {
      alert("¡Debes subir una foto de la mascota!"); // Or use a Snackbar
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Upload image to Backblaze B2
      const uploadedUrl = await petsService.uploadPetImage(imageFile);

      // Step 2: Adapt the JSON
      const backendPayload = adaptPetFormToBackend(data, uploadedUrl);

      // Step 3: Send to FastAPI (Llama 3 generates the profile here)
      await petsService.registerPet(backendPayload);

      // Step 4: Show success state
      setIsSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving pet:", error?.response?.data || error);

      let errorMessage = error?.message || "Error desconocido";
      const detail = error?.response?.data?.detail;

      if (detail) {
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // Parse FastAPI Pydantic validation array (e.g. 422 Unprocessable Entity)
          errorMessage = detail
            .map(
              (err: { loc?: string[]; msg?: string }) =>
                `${err.loc?.join(".")} - ${err.msg}`,
            )
            .join(" | ");
        } else if (detail.message) {
          errorMessage = detail.message;
        }
      }

      alert(`Ocurrió un error al registrar la mascota: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AdminLayout>
        <Box sx={{ textAlign: "center", py: 10, px: 2 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="success.main"
            gutterBottom
          >
            ¡Perfil Registrado con Éxito!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            La mascota ha sido registrada y la Inteligencia Artificial ya generó
            su biografía.
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate("/admin/pets")}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            Ver Catálogo de Mascotas
          </Button>
        </Box>
      </AdminLayout>
    );
  }

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
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: imagePreview ? "success.main" : "grey.300",
            borderRadius: 3,
            p: imagePreview ? 0 : 6,
            textAlign: "center",
            mb: 4,
            bgcolor: "grey.50",
            cursor: "pointer",
            overflow: "hidden", // So the image doesn't overflow the box
            height: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
          }}
        >
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              <CloudUploadIcon
                sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
              />
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Arrastra y suelta la imagen aquí o haz clic
              </Typography>
            </>
          )}
        </Box>

        {/* FORM FIELDS */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Controller
                name="especie"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Especie *"
                    fullWidth
                    error={!!errors.especie}
                    helperText={errors.especie?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  >
                    <MenuItem value="Perro">Perro</MenuItem>
                    <MenuItem value="Gato">Gato</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre *"
                    fullWidth
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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

            {/* AGE FIELD (Fixed numeric parsing) */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="edad"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Edad (Años) *"
                    fullWidth
                    value={value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val === "" ? undefined : Number(val));
                    }}
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

            {/* WEIGHT FIELD (Fixed numeric parsing) */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="peso"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Peso (kg) *"
                    fullWidth
                    value={value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val === "" ? undefined : Number(val));
                    }}
                    error={!!errors.peso}
                    helperText={errors.peso?.message}
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

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="desparasitado"
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
                              Desparasitado
                            </Typography>
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* Dynamic Vaccines based on Species */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, borderColor: "info.200" }} />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="info.900"
                      sx={{ mb: 1 }}
                    >
                      Vacunas Aplicadas ({selectedSpecies})
                    </Typography>
                    <Controller
                      name="vacunas"
                      control={control}
                      render={({ field }) => (
                        <FormGroup row>
                          {availableVaccines.map((vaccineKey) => (
                            <FormControlLabel
                              key={vaccineKey}
                              label={
                                <Typography variant="body2" color="info.900">
                                  {VACCINE_LABELS[vaccineKey]}
                                </Typography>
                              }
                              control={
                                <Checkbox
                                  color="info"
                                  checked={field.value.includes(vaccineKey)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([
                                        ...field.value,
                                        vaccineKey,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (v) => v !== vaccineKey,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              }
                            />
                          ))}
                        </FormGroup>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* SPECIAL CONDITIONS */}
            <Grid item xs={12}>
              <Controller
                name="condicionesEspeciales"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Condiciones Especiales (Opcional)"
                    placeholder="Ej: Ceguera, requiere dieta especial (separado por comas)"
                    fullWidth
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
            </Grid>

            {/* BIOGRAPHY & AI */}
            <Grid item xs={12}>
              <Box sx={{ mb: 1, mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Contexto para la Inteligencia Artificial *
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Escribe una breve descripción. El sistema usará Llama 3 para
                  redactar la biografía final automáticamente tras publicar.
                </Typography>
              </Box>
              <Controller
                name="biografia"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Ej: Leonel es un perro grande, muy amigable y le encanta jugar con niños..."
                    error={!!errors.biografia}
                    helperText={errors.biografia?.message}
                    InputProps={{ sx: { bgcolor: "grey.50" } }}
                  />
                )}
              />
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
