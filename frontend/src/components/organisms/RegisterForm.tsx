// src/components/organisms/RegisterForm.tsx

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthToggle } from "../molecules/AuthToggle";
import { SocialLoginGroup } from "../molecules/SocialLoginGroup";
import { authService } from "../../services/auth.service";
import type { RegisterApiRequest } from "../../types/auth.types";

// ==========================================
// ZOD SCHEMA DEFINITION
// ==========================================
const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, "Debe tener al menos 2 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
    last_name: z
      .string()
      .trim()
      .min(2, "Debe tener al menos 2 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
    email: z
      .string()
      .trim()
      .min(1, "Este campo es requerido")
      .email("Correo electrónico no válido"),
    phone_number: z
      .string()
      .trim()
      .regex(/^09\d{8}$/, "Debe tener 10 dígitos y empezar con 09"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(16, "Máximo 16 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos 1 mayúscula")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos 1 símbolo"),
    confirmPassword: z.string().min(1, "Este campo es requerido"),
    requested_role: z.enum(["adopter", "admin"]).default("adopter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Puts the error specifically on the confirmPassword field
  });

// Infer the TypeScript type from the Zod Schema
type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    requested_role: "adopter",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Field-specific error states
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  // ==========================================
  // REAL-TIME PASSWORD SECURITY EVALUATION
  // ==========================================
  const isPasswordValidLength =
    formData.password.length >= 8 && formData.password.length <= 16;
  const hasPasswordUppercase = /[A-Z]/.test(formData.password);
  const hasPasswordSymbol = /[^A-Za-z0-9]/.test(formData.password);
  const isPasswordSecure =
    isPasswordValidLength && hasPasswordUppercase && hasPasswordSymbol;

  const getPasswordHelperText = () => {
    if (fieldErrors.password) return fieldErrors.password;
    if (!formData.password)
      return "Requerido: 8-16 caracteres, 1 mayúscula y 1 símbolo";

    const missingCriteria = [];
    if (!isPasswordValidLength) missingCriteria.push("8-16 caracteres");
    if (!hasPasswordUppercase) missingCriteria.push("1 mayúscula");
    if (!hasPasswordSymbol) missingCriteria.push("1 símbolo");

    if (missingCriteria.length === 0) return "¡Contraseña segura y válida!";
    return `Falta: ${missingCriteria.join(", ")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");

    // Clear specific field error when typing
    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // 1. Zod Validation
    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      // Map Zod errors to our fieldErrors state
      const formattedErrors: Partial<Record<keyof RegisterFormData, string>> =
        {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof RegisterFormData;
        // Only set the first error for each field
        if (!formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });

      setFieldErrors(formattedErrors);
      setError("Por favor, corrige los errores antes de continuar.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Prepare payload removing UI-only fields like confirmPassword
      const apiPayload: RegisterApiRequest = {
        first_name: validationResult.data.first_name,
        last_name: validationResult.data.last_name,
        email: validationResult.data.email,
        phone_number: validationResult.data.phone_number,
        password: validationResult.data.password,
        requested_role: validationResult.data.requested_role,
      };

      await authService.register(apiPayload);

      navigate("/login", {
        replace: true,
        state: {
          successMessage:
            "¡Cuenta creada con éxito! Ahora puedes iniciar sesión.",
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Hubo un error al registrar el usuario. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <AuthToggle />

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Crear Cuenta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Únete a SmartAdopt para comenzar tu camino
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre *"
              name="first_name"
              fullWidth
              value={formData.first_name}
              onChange={handleChange}
              error={!!fieldErrors.first_name}
              helperText={fieldErrors.first_name}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellido *"
              name="last_name"
              fullWidth
              value={formData.last_name}
              onChange={handleChange}
              error={!!fieldErrors.last_name}
              helperText={fieldErrors.last_name}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Correo Electrónico *"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Número de Teléfono *"
              name="phone_number"
              fullWidth
              value={formData.phone_number}
              onChange={handleChange}
              error={!!fieldErrors.phone_number}
              helperText={fieldErrors.phone_number || "Formato: 09..."}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>

          {/* DYNAMIC PASSWORD FIELD */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contraseña *"
              name="password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              error={
                !!fieldErrors.password ||
                (formData.password.length > 0 && !isPasswordSecure)
              }
              helperText={getPasswordHelperText()}
              FormHelperTextProps={{
                sx: {
                  color:
                    formData.password.length > 0 &&
                    isPasswordSecure &&
                    !fieldErrors.password
                      ? "success.main"
                      : "inherit",
                  fontWeight: formData.password.length > 0 ? 600 : 400,
                },
              }}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Confirmar Contraseña *"
              name="confirmPassword"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="warning"
          size="large"
          fullWidth
          disabled={isLoading}
          sx={{ py: 1.5, mt: 3 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Crear Cuenta"
          )}
        </Button>
      </Box>

      <SocialLoginGroup />

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ color: "text.secondary" }}
        >
          ← Volver a inicio
        </Button>
      </Box>
    </Box>
  );
};
