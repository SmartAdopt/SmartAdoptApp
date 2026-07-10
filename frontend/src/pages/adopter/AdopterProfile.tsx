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
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/profile.service";

// ==========================================
// ZOD SCHEMA DEFINITIONS
// ==========================================

// Profile form schema (removed idNumber — no backend support)
const profileSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Correo inválido"),
  phone: z
    .string()
    .regex(/^09\d{8}$/, "Formato: 09... (10 dígitos)")
    .or(z.literal("")), // Allows the field to remain blank safely
});

// Change password schema — matches backend validation rules
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const AdopterProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Change Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Consume the real session data from AuthContext
  const { user, updateUser } = useAuth();

  // Compute first and last name from the single 'name' property inside AuthSession
  const nameParts = user?.name ? user.name.trim().split(" ") : ["", ""];
  const derivedFirstName = nameParts[0] || "";
  const derivedLastName = nameParts.slice(1).join(" ") || "";

  // Format the member since date
  const rawDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : "Fecha desconocida";
  const memberSince = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  // Profile form
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
      phone: user?.phone_number || "",
    },
  });

  // Password form
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
        phone: user.phone_number || "",
      });
    }
  }, [user, reset]);

  // Handle profile save — calls PUT /adopter/profile
  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      await profileService.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone || undefined, // Don't send empty string
      });

      // Sync the local AuthSession so header/sidebar update immediately
      updateUser({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone_number: data.phone || undefined,
      });

      setSuccessToast("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error al actualizar el perfil. Intenta nuevamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing — revert form to stored values
  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMessage("");
    if (user) {
      const parts = user.name ? user.name.trim().split(" ") : ["", ""];
      reset({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone_number || "",
      });
    }
  };

  // Handle password change — calls PUT /adopter/profile with password fields
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    setPasswordError("");

    try {
      await profileService.changePassword(
        data.currentPassword,
        data.newPassword
      );
      setPasswordDialogOpen(false);
      resetPassword();
      setSuccessToast("Contraseña actualizada exitosamente");
    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError("Error al cambiar la contraseña. Intenta nuevamente.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle closing the password dialog
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    resetPassword();
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSaving}
                  >
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Error alert for profile save failures */}
            {errorMessage && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setErrorMessage("")}
              >
                {errorMessage}
              </Alert>
            )}

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
                          isEditing
                            ? "Número de teléfono de 10 dígitos"
                            : "No se ha registrado ningún número de teléfono."
                        }
                        InputLabelProps={{ shrink: true }}
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
                  onClick={() => setPasswordDialogOpen(true)}
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
            <Grid item xs={12}>
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
                  {memberSince}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ==========================================
          CHANGE PASSWORD DIALOG
          ========================================== */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
          }}
        >
          Cambiar Contraseña
          <IconButton onClick={handleClosePasswordDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {passwordError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setPasswordError("")}
            >
              {passwordError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
          >
            <Controller
              name="currentPassword"
              control={passwordControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contraseña Actual"
                  type={showCurrentPassword ? "text" : "password"}
                  fullWidth
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword?.message}
                  InputProps={{
                    sx: { bgcolor: "grey.50" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          edge="end"
                          size="small"
                        >
                          {showCurrentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={passwordControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nueva Contraseña"
                  type={showNewPassword ? "text" : "password"}
                  fullWidth
                  error={!!passwordErrors.newPassword}
                  helperText={
                    passwordErrors.newPassword?.message ||
                    "Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
                  }
                  InputProps={{
                    sx: { bgcolor: "grey.50" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={passwordControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirmar Nueva Contraseña"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword?.message}
                  InputProps={{
                    sx: { bgcolor: "grey.50" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClosePasswordDialog}
            color="inherit"
            disabled={isChangingPassword}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordSubmit(onPasswordSubmit)}
            variant="contained"
            color="primary"
            disabled={isChangingPassword}
            startIcon={
              isChangingPassword ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS TOAST */}
      <Snackbar
        open={!!successToast}
        autoHideDuration={5000}
        onClose={() => setSuccessToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessToast("")}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {successToast}
        </Alert>
      </Snackbar>
    </AdopterLayout>
  );
};
