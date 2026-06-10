// src/components/molecules/PetCard.tsx
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Typography, 
  Chip, 
  Box 
} from "@mui/material";

// ENTERPRISE BEST PRACTICE:
// Export the interface so it can be used by services, stores, or pages.
export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  matchPercentage: number;
}

interface PetCardProps {
  pet: Pet;
  onAdoptClick?: (petId: string) => void; // Pass actions as callbacks for reusability
}

export const PetCard = ({ pet, onAdoptClick }: PetCardProps) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2 }}>
      <CardMedia
        component="img"
        height="200"
        image="/react.svg" // Default React SVG as requested
        alt={`Fotografía de ${pet.name}`}
        sx={{ objectFit: "contain", p: 2, bgcolor: "grey.100" }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography gutterBottom variant="h5" component="h2" sx={{ mb: 0, fontWeight: "bold" }}>
            {pet.name}
          </Typography>
          <Chip label={`${pet.matchPercentage}% Compatible`} color="success" size="small" />
        </Box>
        <Typography color="text.secondary">Raza: {pet.breed}</Typography>
        <Typography color="text.secondary">Edad: {pet.age}</Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          variant="contained" 
          fullWidth 
          disableElevation
          onClick={() => onAdoptClick && onAdoptClick(pet.id)}
        >
          Ver Perfil y Adoptar
        </Button>
      </CardActions>
    </Card>
  );
};