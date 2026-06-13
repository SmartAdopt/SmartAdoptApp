// src/components/organisms/AdopterSidebar.tsx
import { Box, List, Button, Divider } from "@mui/material";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Favorite as FavoriteIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon, // Icon for public site navigation
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarItem } from "../atoms/SidebarItem";
import { Logo } from "../atoms/Logo"; // Imported to replace the placeholder
import { useAuth } from "../../hooks/useAuth";

export const AdopterSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser } = useAuth();

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
      {/* 1. CLICKABLE LOGO: Navigates to the public landing page */}
      <Box
        onClick={() => navigate("/")}
        sx={{
          px: 3,
          mb: 4,
          cursor: "pointer",
          transition: "opacity 0.2s",
          "&:hover": { opacity: 0.8 },
        }}
      >
        <Logo />
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

        <Divider sx={{ my: 2 }} />

        {/* 2. PUBLIC SITE NAVIGATION: Standard item to go back to landing page */}
        <SidebarItem
          icon={<LanguageIcon />}
          label="Ver Sitio Público"
          selected={location.pathname === "/"}
          onClick={() => navigate("/")}
        />
      </List>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          variant="outlined"
          color="inherit"
          onClick={() => logoutUser()}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );
};
