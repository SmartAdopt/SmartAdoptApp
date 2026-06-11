// src/components/molecules/PetCard.tsx

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

interface PetCardProps {
  nombre: string;
  raza: string;
  edad: string;
  genero: string;
  ubicacion: string;
  imagen: string;
}

export const PetCard = ({
  nombre,
  raza,
  edad,
  genero,
  ubicacion,
  imagen,
}: PetCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <CardMedia
        component="img"
        height="220"
        image={imagen}
        alt={nombre}
      />

      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {nombre}
          </Typography>

          <FavoriteBorderIcon />
        </Stack>

        <Typography
          color="text.secondary"
          gutterBottom
        >
          {raza}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          mb={2}
        >
          <Chip
            label={edad}
            size="small"
          />

          <Chip
            label={genero}
            size="small"
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          📍 {ubicacion}
        </Typography>

        <Button
          fullWidth
          variant="contained"
        >
          Ver Perfil
        </Button>
      </CardContent>
    </Card>
  );
};