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

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo is our custom Atom */}
          <Logo />

          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 2 },
              alignItems: "center",
            }}
          >
            <IconButton color="inherit" aria-label="favorites">
              <img src="/home.svg" width={24} />
            </IconButton>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
              disableElevation
              sx={{ borderRadius: 2 }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
