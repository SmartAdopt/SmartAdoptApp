// src/components/molecules/PetCard.tsx

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  IconButton, // <-- NEW
} from "@mui/material";

// NEW: Import both heart states
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { usePetDatabase } from "../../context/PetContext"; // <-- NEW: Import context

interface PetCardProps {
  id: string;
  nombre: string;
  raza: string;
  edad: string;
  genero: string;
  ubicacion: string;
  imagen: string;
}

export const PetCard = ({
  id,
  nombre,
  raza,
  edad,
  genero,
  ubicacion,
  imagen,
}: PetCardProps) => {
  const navigate = useNavigate();

  // Consume favorites state and toggler from our Context
  const { favoritePetIds, toggleFavorite } = usePetDatabase();
  const isFavorite = favoritePetIds.includes(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents triggering other click events on the card
    toggleFavorite(id);
  };

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
      <CardMedia component="img" height="220" image={imagen} alt={nombre} />

      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {nombre}
          </Typography>

          {/* DYNAMIC HEART BUTTON */}
          <IconButton
            onClick={handleFavoriteClick}
            color={isFavorite ? "error" : "default"} // Red color if favorite
            size="small"
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>

        <Typography color="text.secondary" gutterBottom>
          {raza}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={edad} size="small" />
          <Chip label={genero} size="small" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          📍 {ubicacion}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate(`/adopter/pet/${id}`)}
        >
          Ver Perfil
        </Button>
      </CardContent>
    </Card>
  );
};
