// src/components/organisms/AdopterSidebar.tsx
import { Box, List, Button } from "@mui/material";
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

  // We extract logoutUser from our new Context
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    // logoutUser already handles clearing tokens and redirecting
    logoutUser();
  };

  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#FFFFFF",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        py: 3,
      }}
    >
      <Box sx={{ px: 3, mb: 4 }}>
        {/* Placeholder for Logo if needed */}
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        <SidebarItem
          icon={<HomeIcon />}
          label="Inicio"
          selected={location.pathname === "/adopter/dashboard"}
          onClick={() => navigate("/adopter/dashboard")}
        />

        <SidebarItem
          icon={<SearchIcon />}
          label="Explorar"
          selected={location.pathname === "/adopter/explore"}
          onClick={() => navigate("/adopter/explore")}
        />

        <SidebarItem
          icon={<DescriptionIcon />}
          label="Solicitudes"
          selected={location.pathname === "/adopter/requests"}
          onClick={() => navigate("/adopter/requests")}
        />

        <SidebarItem
          icon={<FavoriteIcon />}
          label="Favoritos"
          selected={location.pathname === "/adopter/favorites"}
          onClick={() => navigate("/adopter/favorites")}
        />

        <SidebarItem
          icon={<AssignmentTurnedInIcon />}
          label="Idoneidad"
          selected={location.pathname === "/adopter/suitability"}
          onClick={() => navigate("/adopter/suitability")}
        />

        <SidebarItem
          icon={<PersonIcon />}
          label="Perfil"
          selected={location.pathname === "/adopter/profile"}
          onClick={() => navigate("/adopter/profile")}
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
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );
};