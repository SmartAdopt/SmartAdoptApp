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

export const LoginForm = () => {
  // 1. Drive the form inputs with local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. We use the login function from our AuthContext to save the session after successful login
  const { login } = useAuth();
  const navigate = useNavigate();

  // 3. Function that runs when the form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setError("");
    setIsLoading(true);

    try {
      // Llama a nuestro servicio simulado (que apunta a json-server)
      const response = await authService.login(email, password);

      // Save the session in the global context
      login(response);

      // Redirect based on user role (RBAC) [cite: 49]
      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/adopter/profile"); // The adopter goes to the catalog (HomePage)
      }
    } catch {
      setError("Credenciales inválidas. Intenta de nuevo.");
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

      {/* FORMULARIO: Conectado a la función handleSubmit */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Mostramos errores si existen */}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Correo Electrónico"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ejemplo.com"
          InputProps={{ sx: { bgcolor: "grey.50" } }}
        />
        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
