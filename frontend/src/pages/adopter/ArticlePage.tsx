// src/pages/adopter/ArticlePage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { dashboardService } from "../../services/dashboard.service";
import type { Article } from "../../types/dashboard.types";
import { logger } from "../../utils/logger";

export const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        // We fetch all articles and filter by id since there isn't a getArticleById method yet
        const data = await dashboardService.getArticles();
        const found = data.find((a) => a.id === id);
        setArticle(found || null);
      } catch (error) {
        logger.error("Error loading article:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <AdopterLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </AdopterLayout>
    );
  }

  if (!article) {
    return (
      <AdopterLayout>
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Artículo no encontrado
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Volver al Dashboard
          </Button>
        </Box>
      </AdopterLayout>
    );
  }

  return (
    <AdopterLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", pb: 6 }}>
        {/* Navigation */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: "text.secondary", textTransform: "none" }}
        >
          Volver al Dashboard
        </Button>

        {/* Hero Image */}
        <Box
          component="img"
          src={article.imagen}
          alt={article.titulo}
          sx={{
            width: "100%",
            height: { xs: 200, md: 350 },
            objectFit: "cover",
            borderRadius: 4,
            mb: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        />

        {/* Header content */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Chip
              icon={<CategoryIcon fontSize="small" />}
              label={article.categoria}
              color="primary"
              size="small"
            />
            <Chip
              icon={<AccessTimeIcon fontSize="small" />}
              label={`${article.minutosLectura} min de lectura`}
              variant="outlined"
              size="small"
            />
          </Box>

          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
          >
            {article.titulo}
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ fontSize: "1.2rem", lineHeight: 1.6 }}
          >
            {article.descripcion}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Generic Content (since API doesn't provide body text yet) */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "grey.100",
          }}
        >
          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
          >
            Adoptar una mascota es una decisión importante que cambiará tu vida
            y la de un animal necesitado. Es fundamental estar preparado
            emocional y físicamente para recibir a un nuevo miembro en la
            familia.
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={{ mt: 4, mb: 2 }}
          >
            Puntos clave a considerar
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
          >
            1. <strong>Tiempo y Dedicación:</strong> Las mascotas requieren
            atención diaria, paseos, juegos y cariño. Asegúrate de contar con el
            tiempo suficiente en tu rutina.
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
          >
            2. <strong>Espacio Adecuado:</strong> Dependiendo del tamaño y
            energía del animal, necesitará más o menos espacio. Un gato puede
            vivir cómodamente en un departamento, pero un perro grande podría
            necesitar un patio.
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
          >
            3. <strong>Compromiso a Largo Plazo:</strong> Los perros y gatos
            pueden vivir 15 años o más. La adopción es un compromiso de por vida
            con el bienestar del animal.
          </Typography>

          <Box
            sx={{
              mt: 5,
              p: 3,
              bgcolor: "primary.50",
              borderRadius: 2,
              borderLeft: "4px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary.dark"
            >
              ¿Sabías que...?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Al adoptar no solo le das un hogar a un animal que lo necesita,
              sino que también liberas espacio en los refugios para que puedan
              rescatar a otros animales en situación de calle.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </AdopterLayout>
  );
};
