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

interface ArticleCardProps {
  titulo: string;
  descripcion: string;
  categoria: string;
  minutosLectura: number;
  imagen: string;
}

export const ArticleCard = ({
  titulo,
  descripcion,
  categoria,
  minutosLectura,
  imagen,
}: ArticleCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        height: "100%",
      }}
    >
      <CardMedia component="img" height="180" image={imagen} alt={titulo} />

      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={categoria} size="small" color="primary" />

          <Chip label={`${minutosLectura} min`} size="small" />
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {titulo}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {descripcion}
        </Typography>

        <Button size="small" variant="text">
          Leer más
        </Button>
      </CardContent>
    </Card>
  );
};
