// src/pages/InfoPage.tsx

import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/organisms/Navbar";
import { Footer } from "../components/organisms/Footer";

export const InfoPage = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Listen to changes in the URL hash to smooth scroll to the section
  useEffect(() => {
    if (hash) {
      // We use setTimeout to ensure the DOM is already rendered
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Navbar />

      <Box sx={{ flexGrow: 1, py: 6 }}>
        <Container maxWidth="md">
          {/* 👇 NEW BACK BUTTON 👇 */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)} // Returns to the previous view (Home, Explore, etc.)
            sx={{
              mb: 3,
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Volver a la página anterior
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              textAlign="center"
              color="primary.main"
            >
              Centro de Información
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 6 }}
            >
              Todo lo que necesitas saber sobre SmartAdopt, nuestro proceso y
              políticas.
            </Typography>

            {/* SECTION 1: About Us */}
            <Box id="nosotros" sx={{ scrollMarginTop: "100px", mb: 6 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Acerca de Nosotros
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                SmartAdopt es una plataforma impulsada por Inteligencia
                Artificial dedicada a transformar la manera en que los animales
                rescatados encuentran su hogar definitivo. Colaboramos con
                refugios locales en Ecuador para garantizar que cada adopción
                sea responsable, segura y compatible con el estilo de vida del
                adoptante.
              </Typography>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* SECTION 2: Adoption Process */}
            <Box id="proceso" sx={{ scrollMarginTop: "100px", mb: 6 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Proceso de Adopción
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Adoptar con nosotros es un proceso transparente y diseñado para
                el bienestar animal. Consta de 4 pasos:
              </Typography>
              <Box component="ol" sx={{ color: "text.secondary", pl: 3 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Registro:</strong> Crea tu cuenta y completa el
                    formulario de idoneidad.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Emparejamiento:</strong> Nuestro sistema IA te
                    sugerirá las mascotas más afines a ti.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Solicitud:</strong> Envía una solicitud de adopción
                    a la mascota que te robó el corazón.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Aprobación:</strong> El administrador revisará tu
                    perfil y coordinará la entrega de tu nuevo compañero.
                  </Typography>
                </li>
              </Box>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* SECTION 3: Frequently Asked Questions */}
            <Box id="faq" sx={{ scrollMarginTop: "100px", mb: 6 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Preguntas Frecuentes
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
                ¿Tiene algún costo adoptar?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                No, todas las adopciones son 100% gratuitas. Sin embargo,
                aceptamos donaciones voluntarias para seguir apoyando a los
                refugios.
              </Typography>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
                ¿Puedo devolver a la mascota si no nos adaptamos?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Sí. Aunque nuestro sistema IA reduce drásticamente los casos de
                incompatibilidad, siempre recibiremos a la mascota de vuelta si
                la situación lo requiere.
              </Typography>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* SECTION 4: Privacy Policy */}
            <Box id="privacidad" sx={{ scrollMarginTop: "100px" }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Política de Privacidad
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Tu privacidad es fundamental para nosotros. Los datos
                recolectados en tu perfil de idoneidad (cédula, dirección,
                teléfono) son utilizados única y exclusivamente por los
                administradores autorizados para verificar la viabilidad de la
                adopción. No compartimos ni vendemos tu información a terceros
                bajo ninguna circunstancia.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};
