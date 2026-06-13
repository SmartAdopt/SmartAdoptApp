// src/components/organisms/ArticlesSection.tsx

import { Paper, Typography, Grid, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard.service";
import { type Article } from "../../types/dashboard.types";
import { ArticleCard } from "../molecules/ArticleCard";

export const ArticlesSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadArticles = async () => {
      const data = await dashboardService.getArticles();

      setArticles(data);
    };

    loadArticles();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Grid item xs={6}>
          <Typography variant="h6" fontWeight={700}>
            Artículos y Recursos
          </Typography>
        </Grid>

        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Button>Ver Todos</Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={4} key={article.id}>
            <ArticleCard
              titulo={article.titulo}
              descripcion={article.descripcion}
              categoria={article.categoria}
              minutosLectura={article.minutosLectura}
              imagen={article.imagen}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
