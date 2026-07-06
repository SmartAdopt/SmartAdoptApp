// src/components/organisms/Footer.tsx

import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";
// FIX: Imported 'useLocation' to inspect the current route
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../atoms/Logo";

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Detects the current browser URL
  const { isAuthenticated } = useAuth();

  // Conditional routing logic for "Explore Pets"
  const handleExploreClick = () => {
    if (isAuthenticated) {
      navigate("/adopter/explore");
    } else {
      navigate("/login");
    }
  };

  // =======================================================================
  // OPTIMIZED HISTORY VALIDATION (Prevents accumulating back clicks)
  // =======================================================================
  const handleInfoNav = (hash: string) => {
    // If the user is already on '/info', we use 'replace: true' to not saturate the history.
    // If coming from another page (like Home), we do a normal push so they can go back.
    const isAlreadyOnInfoPage = location.pathname === "/info";

    navigate(`/info${hash}`, { replace: isAlreadyOnInfoPage });
  };

  return (
    <Box sx={{ bgcolor: "#0F172A", color: "grey.400", pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Column 1: Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ filter: "brightness(0) invert(1)", mb: 2 }}>
              <Logo />
            </Box>
            <Typography variant="body2" sx={{ maxWidth: 280 }}>
              Conectando hogares amorosos con mascotas necesitadas mediante
              tecnología inteligente.
            </Typography>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid item xs={12} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              color="white"
              fontWeight={600}
              gutterBottom
            >
              Enlaces Rápidos
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <MuiLink
                component={RouterLink}
                to="/login"
                color="inherit"
                underline="hover"
                variant="body2"
              >
                Iniciar Sesión
              </MuiLink>
              <MuiLink
                component={RouterLink}
                to="/register"
                color="inherit"
                underline="hover"
                variant="body2"
              >
                Registrarse
              </MuiLink>
              <MuiLink
                component="button"
                onClick={handleExploreClick}
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{
                  border: "none",
                  background: "transparent",
                  p: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                Explorar Mascotas
              </MuiLink>
            </Box>
          </Grid>

          {/* Column 3: Info */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="subtitle2"
              color="white"
              fontWeight={600}
              gutterBottom
            >
              Información
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <MuiLink
                component="button"
                onClick={() => handleInfoNav("#nosotros")}
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{
                  border: "none",
                  background: "transparent",
                  p: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                Acerca de Nosotros
              </MuiLink>
              <MuiLink
                component="button"
                onClick={() => handleInfoNav("#proceso")}
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{
                  border: "none",
                  background: "transparent",
                  p: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                Proceso de Adopción
              </MuiLink>
              <MuiLink
                component="button"
                onClick={() => handleInfoNav("#faq")}
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{
                  border: "none",
                  background: "transparent",
                  p: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                Preguntas Frecuentes
              </MuiLink>
              <MuiLink
                component="button"
                onClick={() => handleInfoNav("#privacidad")}
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{
                  border: "none",
                  background: "transparent",
                  p: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                Política de Privacidad
              </MuiLink>
            </Box>
          </Grid>

          {/* Column 4: Contact & Social Networks */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="subtitle2"
              color="white"
              fontWeight={600}
              gutterBottom
            >
              Contacto
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✉ info@smartadopt.ec
            </Typography>
            <Typography variant="body2" gutterBottom>
              📞 +593 99 123 4567
            </Typography>
            <Typography variant="body2" gutterBottom>
              📍 Quito, Ecuador
            </Typography>

            {/* SOCIAL NETWORKS BLOCK */}
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <IconButton
                size="small"
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "grey.400",
                  bgcolor: "rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(24, 119, 242, 0.2)",
                    color: "#1877F2",
                  },
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                aria-label="WhatsApp"
                href="https://wa.me/593991234567"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "grey.400",
                  bgcolor: "rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(37, 211, 102, 0.2)",
                    color: "#25D366",
                  },
                }}
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "grey.400",
                  bgcolor: "rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(228, 64, 95, 0.2)",
                    color: "#E4405F",
                  },
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom copyright */}
        <Typography
          variant="caption"
          align="center"
          display="block"
          sx={{
            borderTop: "1px solid",
            borderColor: "rgba(255,255,255,0.1)",
            pt: 4,
          }}
        >
          © 2026 SmartAdopt. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};
