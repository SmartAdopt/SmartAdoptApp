// src/components/organisms/LoginForm.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { AuthToggle } from "../molecules/AuthToggle";
import { SocialLoginGroup } from "../molecules/SocialLoginGroup";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth.service";
import type { LoginApiRequest } from "../../types/auth.types";

export const LoginForm = () => {
  const [credentials, setCredentials] = useState<LoginApiRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for the success Toast notification
  const [successToast, setSuccessToast] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    // Check if there is a success message coming from the Register view
    if (location.state?.successMessage) {
      const message = location.state.successMessage;
      // Clean the history state to prevent the toast from reappearing on page reload
      window.history.replaceState({}, document.title);

      // Delay state update to avoid synchronous cascading renders
      setTimeout(() => {
        setSuccessToast(message);
      }, 0);
    }
  }, [location]);

  const handleCloseToast = () => setSuccessToast("");

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const session = await authService.login(credentials);

      // Save the session globally and in local storage
      loginUser(session);

      const userRole = session.role?.toLowerCase();

      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/adopter/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Credenciales inválidas. Por favor intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <AuthToggle />

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Bienvenido de Vuelta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Inicia sesión para acceder a tu cuenta
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Correo Electrónico"
          name="email"
          variant="outlined"
          fullWidth
          required
          value={credentials.email}
          onChange={handleChange}
          placeholder="tu@ejemplo.com"
          InputProps={{ sx: { bgcolor: "grey.50" } }}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={credentials.password}
          onChange={handleChange}
          placeholder="••••••••"
          InputProps={{ sx: { bgcolor: "grey.50" } }}
        />

        {/* Removed demo credentials alert to keep UI clean */}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={isLoading}
          sx={{ py: 1.5 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </Box>

      {/* Renders our updated SocialLoginGroup which only has Google now */}
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

      {/* Material UI Snackbar Component for success notification */}
      <Snackbar
        open={!!successToast}
        autoHideDuration={6000} // Will automatically close after 6 seconds
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {successToast}
        </Alert>
      </Snackbar>
    </Box>
  );
};
