// src/components/organisms/LoginForm.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthToggle } from "../molecules/AuthToggle";
import { SocialLoginGroup } from "../molecules/SocialLoginGroup";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";
import type { LoginApiRequest } from "../../types/auth.types"; // Import the strict contract type

export const LoginForm = () => {
  // 1. Drive the form inputs with local state using the API interface
  const [credentials, setCredentials] = useState<LoginApiRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 2. We use the login function from our AuthContext to save the session after successful login
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle generic input changes for scalability
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when user types
  };

  // 3. Function that runs when the form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const session = await authService.login(credentials);

      // 🕵️‍♂️ DIAGNOSTIC LINE: Check the console (F12) to see exactly what arrived
      console.log("Sesión recibida del Backend:", session);

      // Save the session in the global context
      login(session);

      // Extract the role, convert it to lowercase, and use Optional Chaining (?.)
      const userRole = session.user?.role?.toLowerCase();

      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        // SOLUCIÓN: Cambia "/adopter/profile" por "/adopter/dashboard"
        navigate("/adopter/dashboard"); 
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
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

      {/* FORM: Connected to the handleSubmit function */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Display backend validation errors if they exist */}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Correo Electrónico"
          name="email" // Required to bind with handleChange
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
          name="password" // Required to bind with handleChange
          type="password"
          variant="outlined"
          fullWidth
          required
          value={credentials.password}
          onChange={handleChange}
          placeholder="••••••••"
          InputProps={{ sx: { bgcolor: "grey.50" } }}
        />

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <strong>Credenciales de Demostración:</strong>
          <br />
          Admin: admin@smartadopt.com / admin123
          <br />
          Adoptante: tu@ejemplo.com / user123
        </Alert>

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
