// src/components/organisms/AdminNavbar.tsx
import { AppBar, Toolbar, Box, Chip, IconButton, Tooltip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Logo } from "../atoms/Logo";
import { useAuth } from "../../hooks/useAuth";

export const AdminNavbar = () => {
  // We extract logoutUser from our new Context
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    // logoutUser already handles clearing tokens and redirecting to /login
    logoutUser();
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "#FFFFFF",
      }}
    >
      <Toolbar
        sx={{ justifyContent: "space-between", py: 1, px: { xs: 2, md: 4 } }}
      >
        {/* BRAND BLOCK */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Logo />
        </Box>

        {/* ACTIONS & SESSION BLOCK */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label="¡Bienvenido de vuelta, Administrador!"
            color="success"
            variant="outlined"
            sx={{
              bgcolor: "#F0FDF4",
              color: "success.dark",
              fontWeight: 500,
              border: "none",
              display: { xs: "none", sm: "inline-flex" }, // Responsive control
            }}
          />

          {/* LOGOUT SYSTEM BUTTON */}
          <Tooltip title="Cerrar sesión">
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#FEF2F2", // Very light red
                  color: "error.main",
                  borderColor: "error.light",
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
