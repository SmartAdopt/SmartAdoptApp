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

  // Generic handler for all text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Business Rule: Validate passwords on the Frontend before calling the API
    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, verifica.");
      return;
    }

    setIsLoading(true);

    try {
      // Send the exact payload structure required by the backend adapter
      await authService.register(formData);

      // On success, notify the user and redirect to login
      // Note: In a future iteration, consider using a MUI Snackbar instead of native alert
      alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err) {
      // Extract the exact error message thrown by FastAPI (e.g., "Email already registered")
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
              name="first_name" // Binds to formData.first_name
              fullWidth
              required
              value={formData.first_name}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellido *"
              name="last_name" // Binds to formData.last_name
              fullWidth
              required
              value={formData.last_name}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Correo Electrónico *"
              name="email" // Binds to formData.email
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Número de Teléfono *"
              name="phone_number" // Binds to formData.phone_number
              fullWidth
              required
              value={formData.phone_number}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contraseña *"
              name="password" // Binds to formData.password
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: "grey.50" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Confirmar *"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
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