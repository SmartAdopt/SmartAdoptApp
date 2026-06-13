// src/components/organisms/Navbar.tsx

import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Logo } from "../atoms/Logo";
import { useAuth } from "../../context/AuthContext";
import { ProfileMenu } from "../molecules/ProfileMenu";

export const Navbar = () => {
  const navigate = useNavigate();
  // 1. Extraemos el estado de la sesión
  const { isAuthenticated, role, user } = useAuth();

  // 2. Lógica dinámica para el botón Home (Casita)
  const handleHomeClick = () => {
    if (isAuthenticated) {
      // Si está logueado, lo mandamos a su dashboard correspondiente
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/adopter/dashboard");
      }
    } else {
      // Si no está logueado, lo mandamos al login como solicitaste
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
          
          {/* Logo clickeable que lleva al landing page */}
          <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <Logo />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 2 },
              alignItems: "center",
            }}
          >
            {/* Casita Dinámica */}
            <IconButton color="inherit" onClick={handleHomeClick}>
              <img src="/home.svg" width={24} alt="Home" />
            </IconButton>

            {/* 3. Renderizado Condicional del Botón de Sesión */}
            {isAuthenticated && user ? (
              // Si está logueado: Mostramos su Menú de Perfil para que pueda salir
              <ProfileMenu userName={user.name} />
            ) : (
              // Si NO está logueado: Mostramos el botón azul original
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
                disableElevation
                sx={{ borderRadius: 2 }}
              >
                Iniciar Sesión
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};