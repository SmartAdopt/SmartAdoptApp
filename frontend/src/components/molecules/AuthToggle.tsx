// src/components/molecules/AuthToggle.tsx

import { Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "grey.100",
        borderRadius: 8,
        p: 0.5,
        mb: 4,
      }}
    >
      <Button
        fullWidth
        disableElevation
        variant={isLogin ? "contained" : "text"}
        // FIX: We use replace: true to avoid cluttering the browser history
        onClick={() => navigate("/login", { replace: true })}
        sx={{
          borderRadius: 8,
          color: isLogin ? "primary.contrastText" : "text.secondary",
          bgcolor: isLogin ? "background.paper" : "transparent",
          boxShadow: isLogin ? "0px 2px 8px rgba(0,0,0,0.05)" : "none",
          "&:hover": { bgcolor: isLogin ? "background.paper" : "grey.200" },
        }}
      >
        <span style={{ color: isLogin ? "#000" : "inherit" }}>
          Iniciar Sesión
        </span>
      </Button>
      <Button
        fullWidth
        disableElevation
        variant={!isLogin ? "contained" : "text"}
        // FIX: We use replace: true to avoid cluttering the browser history
        onClick={() => navigate("/register", { replace: true })}
        sx={{
          borderRadius: 8,
          color: !isLogin ? "primary.contrastText" : "text.secondary",
          bgcolor: !isLogin ? "background.paper" : "transparent",
          boxShadow: !isLogin ? "0px 2px 8px rgba(0,0,0,0.05)" : "none",
          "&:hover": { bgcolor: !isLogin ? "background.paper" : "grey.200" },
        }}
      >
        <span style={{ color: !isLogin ? "#000" : "inherit" }}>
          Registrarse
        </span>
      </Button>
    </Box>
  );
};
