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
  // 1. Extract the session state
  const { isAuthenticated, role, user } = useAuth();

  // 2. Dynamic logic for the Home button (House)
  const handleHomeClick = () => {
    if (isAuthenticated) {
      // If the user is authenticated, we check their role and navigate accordingly
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/adopter/dashboard");
      }
    } else {
      // If the user is not authenticated, we navigate to the login page
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
          {/* Clickeable logo that route to the landing page */}
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
            {/* Dinamic home button */}
            <IconButton color="inherit" onClick={handleHomeClick}>
              <img src="/home.svg" width={24} alt="Home" />
            </IconButton>

            {/* 3. Conditional Rendering of the Login Button */}
            {isAuthenticated && user ? (
              // If the user is authenticated: Show their Profile Menu so they can log out
              <ProfileMenu userName={user.name} />
            ) : (
              // If the user is not authenticated: Show the original blue button
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
