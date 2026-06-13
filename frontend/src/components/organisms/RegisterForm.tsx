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
import { AuthToggle } from "../molecules/AuthToggle";
import { SocialLoginGroup } from "../molecules/SocialLoginGroup";
import { authService } from "../../services/auth.service";
import type { RegisterApiRequest } from "../../types/auth.types";

export const RegisterForm = () => {
  const navigate = useNavigate();

  // 1. Group API payload fields into a single state object
  const [formData, setFormData] = useState<RegisterApiRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    requested_role: "adopter", // Default role for public registration
  });

  // UI-only state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Field-specific error states
  const [fieldErrors, setFieldErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

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
    if (!formData.password)
      return "Requerido: 8-16 caracteres, 1 mayúscula y 1 símbolo";

    const missingCriteria = [];
    if (!isPasswordValidLength) missingCriteria.push("8-16 caracteres");
    if (!hasPasswordUppercase) missingCriteria.push("1 mayúscula");
    if (!hasPasswordSymbol) missingCriteria.push("1 símbolo");

    if (missingCriteria.length === 0) return "¡Contraseña segura y válida!";
    return `Falta: ${missingCriteria.join(", ")}`;
  };

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return "Este campo es requerido";
    if (name.trim().length < 2) return "Debe tener al menos 2 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name))
      return "Solo se permiten letras y espacios";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Este campo es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Correo electrónico no válido";
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Este campo es requerido";
    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/\s/g, "");
    // Must be exactly 10 digits and start with 09
    if (!/^09\d{8}$/.test(cleanPhone))
      return "Debe tener 10 dígitos y empezar con 09";
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Este campo es requerido";

    const isValidLength = password.length >= 8 && password.length <= 16;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!isValidLength || !hasUppercase || !hasSymbol) {
      return "La contraseña no cumple los requisitos de seguridad";
    }
    return "";
  };

  const validateConfirmPassword = (
    password: string,
    confirm: string,
  ): string => {
    if (!confirm) return "Este campo es requerido";
    if (password !== confirm) return "Las contraseñas no coinciden";
    return "";
  };

  // Generic handler for all text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when user types

    // Validate field on change
    let errorMessage = "";
    switch (name) {
      case "first_name":
      case "last_name":
        errorMessage = validateName(value);
        break;
      case "email":
        errorMessage = validateEmail(value);
        break;
      case "phone_number":
        errorMessage = validatePhone(value);
        break;
      case "password":
        errorMessage = validatePassword(value);
        // Cross-validate confirm password if it already has a value
        if (confirmPassword) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value, confirmPassword),
          }));
        }
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (error) setError("");
    const errorMessage = validateConfirmPassword(formData.password, value);
    setFieldErrors((prev) => ({ ...prev, confirmPassword: errorMessage }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    const errors = {
      first_name: validateName(formData.first_name),
      last_name: validateName(formData.last_name),
      email: validateEmail(formData.email),
      phone_number: validatePhone(formData.phone_number),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.password,
        confirmPassword,
      ),
    };

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      setError("Por favor, corrige los errores antes de continuar.");
      return;
    }

    setIsLoading(true);

    try {
      // Send the exact payload structure required by the backend adapter
      await authService.register(formData);

      // On success, notify the user and redirect to login
      alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
      navigate("/login", { replace: true });
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
              required
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
              required
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
              required
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
              required
              value={formData.phone_number}
              onChange={handleChange}
              error={!!fieldErrors.phone_number}
              helperText={fieldErrors.phone_number || "Formato: 09..."}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>

          {/* ======================================= */}
          {/* DYNAMIC PASSWORD FIELD */}
          {/* ======================================= */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contraseña *"
              name="password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
              // Only mark as red error if they started typing and it's not secure yet
              error={formData.password.length > 0 && !isPasswordSecure}
              helperText={getPasswordHelperText()}
              FormHelperTextProps={{
                sx: {
                  // Make it green if secure, otherwise default color
                  color:
                    formData.password.length > 0 && isPasswordSecure
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
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
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
          // Disable button if loading OR if password is not completely secure
          disabled={
            isLoading || (formData.password.length > 0 && !isPasswordSecure)
          }
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
