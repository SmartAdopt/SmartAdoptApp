// src/components/organisms/AdopterSidebar.tsx

import {
  Box,
  Typography,
  List,
  Divider,
  Button,
} from "@mui/material";

import {
  Home as HomeIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Favorite as FavoriteIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

import { SidebarItem } from "../atoms/SidebarItem";

import { useAuth } from "../../hooks/useAuth";

export const AdopterSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();

  // Función actualizada: Asíncrona, limpia tokens, y redirige a la raíz "/"
  const handleLogout = async () => {
    // 1. Resetea el contexto global de autenticación
    logout();

    // 2. Limpia asíncronamente las referencias de los tokens del localStorage
    await Promise.resolve(); // Fuerza el contexto de ejecución asíncrono

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    // 3. Invoca el router push para redirigir al landing page público (raíz)
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        width: 260,
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",

        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary"
        >
          SmartAdopt
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Encuentra tu compañero ideal
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        <SidebarItem
          icon={<HomeIcon />}
          label="Inicio"
          selected={
            location.pathname ===
            "/adopter/dashboard"
          }
          onClick={() =>
            navigate("/adopter/dashboard")
          }
        />

        <SidebarItem
          icon={<SearchIcon />}
          label="Explorar"
          selected={
            location.pathname ===
            "/adopter/explore"
          }
          onClick={() =>
            navigate("/adopter/explore")
          }
        />

        <SidebarItem
          icon={<DescriptionIcon />}
          label="Solicitudes"
          selected={
            location.pathname ===
            "/adopter/requests"
          }
          onClick={() =>
            navigate("/adopter/requests")
          }
        />

        <SidebarItem
          icon={<FavoriteIcon />}
          label="Favoritos"
          selected={
            location.pathname ===
            "/adopter/favorites"
          }
          onClick={() =>
            navigate("/adopter/favorites")
          }
        />

        <SidebarItem
          icon={<AssignmentTurnedInIcon />}
          label="Idoneidad"
          selected={
            location.pathname ===
            "/adopter/suitability"
          }
          onClick={() =>
            navigate("/adopter/suitability")
          }
        />

        <SidebarItem
          icon={<PersonIcon />}
          label="Perfil"
          selected={
            location.pathname ===
            "/adopter/profile"
          }
          onClick={() =>
            navigate("/adopter/profile")
          }
        />
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          variant="outlined"
          color="inherit"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );
};