import { AppBar, Toolbar, Box, Chip, IconButton, Tooltip } from "@mui/material";
import { CheckCircle as CheckCircleIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Logo } from "../atoms/Logo";
import { useAuth } from "../../hooks/useAuth";

export const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // 1. Clear session from global React context state
    logout();

    // 2. Erase core security tokens and session metadata from persistent storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // 3. Purge volatile session data
    sessionStorage.clear();

    // 4. Redirect to the login page clearing the history stack route
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ 
        borderBottom: "1px solid", 
        borderColor: "divider",
        bgcolor: "#FFFFFF"
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1, px: { xs: 2, md: 4 } }}>
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
              display: { xs: "none", sm: "inline-flex" } // Responsive control
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
                  borderColor: "error.light"
                }
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