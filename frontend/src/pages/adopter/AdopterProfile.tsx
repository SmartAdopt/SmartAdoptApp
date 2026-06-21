// src/pages/adopter/AdopterProfile.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { useAuth } from "../../context/AuthContext"; // <-- NEW: Import your real AuthContext

// ==========================================
// ZOD SCHEMA DEFINITION
// Modified to gracefully allow blank/empty strings for missing backend data
// ==========================================
const profileSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Correo inválido"),
  phone: z
    .string()
    .regex(/^09\d{8}$/, "Formato: 09... (10 dígitos)")
    .or(z.literal("")), // Allows the field to remain blank safely
  idNumber: z
    .string()
    .length(10, "La cédula debe tener 10 dígitos")
    .or(z.literal("")), // Allows the field to remain blank safely
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const AdopterProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Consume the real session data from your AuthContext
  const { user } = useAuth();

  // Compute first and last name from the single 'name' property inside AuthSession
  const nameParts = user?.name ? user.name.trim().split(" ") : ["", ""];
  const derivedFirstName = nameParts[0] || "";
  const derivedLastName = nameParts.slice(1).join(" ") || "";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: derivedFirstName,
      lastName: derivedLastName,
      email: user?.email || "",
      phone: "", // Intentionally left blank as it is missing from AuthSession
      idNumber: "", // Intentionally left blank as it is missing from AuthSession
    },
  });

  // Dynamic synchronization: re-populate the form once the async auth session resolves
  useEffect(() => {
    if (user) {
      const parts = user.name ? user.name.trim().split(" ") : ["", ""];
      reset({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: "",
        idNumber: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    // Ready for Sprint 5: await apiClient.put("/users/me", data);
    console.log("Payload ready for backend update request:", data);
    setIsEditing(false);
  };

  return (
    <AdopterLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Mi Perfil
        </Typography>
        <Typography color="text.secondary">
          Gestiona tu información personal y preferencias de cuenta
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: Main Profile Info */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            {/* PROFILE HEADER: Dynamic Avatar & Data */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {user?.name || "Usuario"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || "Sin correo configurado"}
                  </Typography>
                </Box>
              </Box>

              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  color="inherit"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </Button>
              ) : (
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onSubmit)}
                >
                  Guardar Cambios
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Información Personal
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre"
                        fullWidth
                        disabled={!isEditing}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          sx: {
                            bgcolor: isEditing ? "grey.50" : "transparent",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Apellido"
                        fullWidth
                        disabled={!isEditing}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          sx: {
                            bgcolor: isEditing ? "grey.50" : "transparent",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Correo Electrónico"
                        fullWidth
                        disabled={!isEditing}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          sx: {
                            bgcolor: isEditing ? "grey.50" : "transparent",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número de Teléfono"
                        fullWidth
                        disabled={!isEditing}
                        error={!!errors.phone}
                        helperText={
                          errors.phone?.message ||
                          (isEditing ? "Formato requerido: 09XXXXXXXX" : "")
                        }
                        placeholder={
                          isEditing ? "Ej: 0987654321" : "No registrado"
                        }
                        InputProps={{
                          sx: {
                            bgcolor: isEditing ? "grey.50" : "transparent",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="idNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número de Cédula"
                        fullWidth
                        disabled={!isEditing}
                        error={!!errors.idNumber}
                        helperText={errors.idNumber?.message}
                        placeholder={
                          isEditing ? "Ej: 1723456789" : "No registrado"
                        }
                        InputProps={{
                          sx: {
                            bgcolor: isEditing ? "grey.50" : "transparent",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* AUXILIARY ACCOUNT ACTIONS */}
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Acciones de Cuenta
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    color: "text.secondary",
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Completar Formulario de Idoneidad
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    color: "text.secondary",
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Cambiar Contraseña
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Metadata & Status Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.secondary"
                  gutterBottom
                >
                  Estado de Verificación
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color="success.main"
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                    }}
                  />
                  Cuenta Verificada
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.secondary"
                  gutterBottom
                >
                  Miembro Desde
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{ mt: 1, fontWeight: 500 }}
                >
                  Mayo 2026
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AdopterLayout>
  );
};
