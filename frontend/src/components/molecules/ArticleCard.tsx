// src/components/molecules/ArticleCard.tsx

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ArticleCardProps {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  minutosLectura: number;
  imagen: string;
}

export const ArticleCard = ({
  id,
  titulo,
  descripcion,
  categoria,
  minutosLectura,
  imagen,
}: ArticleCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardMedia component="img" height="180" image={imagen} alt={titulo} />

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={categoria} size="small" color="primary" />
          <Chip label={`${minutosLectura} min`} size="small" />
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {titulo}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, flexGrow: 1 }}
        >
          {descripcion}
        </Typography>

        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={() => navigate(`/adopter/article/${id}`)}
          sx={{ alignSelf: "flex-start", borderRadius: 2 }}
        >
          Leer más
        </Button>
      </CardContent>
    </Card>
  );
};
