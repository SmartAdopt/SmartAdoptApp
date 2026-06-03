// src/components/organisms/Footer.tsx
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
} from "@mui/material";
import { Logo } from "../atoms/Logo";

export const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#0F172A", color: "grey.400", pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Column 1: Brand */}
          <Grid item xs={12} md={4}>
            {/* Reusing Logo but forcing white text */}
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Iniciar Sesión
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Registrarse
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Explorar Mascotas
              </Link>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Acerca de Nosotros
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Proceso de Adopción
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Preguntas Frecuentes
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Política de Privacidad
              </Link>
            </Box>
          </Grid>

          {/* Column 4: Contact */}
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
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <IconButton
                size="small"
                sx={{ color: "grey.400", bgcolor: "rgba(255,255,255,0.05)" }}
              >
                <img src="/google.svg" width={16} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "grey.400", bgcolor: "rgba(255,255,255,0.05)" }}
              >
                <img src="/apple_g.svg" width={16} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "grey.400", bgcolor: "rgba(255,255,255,0.05)" }}
              >
                <img src="/facebook.svg" width={16} />
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
