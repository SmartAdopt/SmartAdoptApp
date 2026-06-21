// src/pages/adopter/AdopterExplore.tsx

import { useState, useMemo } from "react";
// FIX 1: Added 'Button' to Material UI imports
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  Pets as PetsIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { PetSearchFilter } from "../../components/molecules/PetSearchFilter";
import { PetCard } from "../../components/molecules/PetCard";
import { petsService } from "../../services/pets.service";
import { usePetDatabase } from "../../context/PetContext";
import type { Pet } from "../../types/dashboard.types";

export const AdopterExplore = () => {
  const navigate = useNavigate();
  const { pets: contextPets } = usePetDatabase();
  const [searchTerm, setSearchTerm] = useState<string>("");

  // TanStack Query orchestration with explicit strict typing <Pet[]>
  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery<Pet[]>({
    queryKey: ["allPets", contextPets],
    queryFn: () => petsService.getAllPets(contextPets),
    staleTime: 1000 * 60 * 5, // Cache entries for 5 minutes
  });

  // Performance-optimized search filtering logic using useMemo
  const filteredPets = useMemo(() => {
    if (!searchTerm) return pets;

    const sanitizeText = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const cleanSearch = sanitizeText(searchTerm);

    return pets.filter(
      (pet: Pet) =>
        sanitizeText(pet.nombre).includes(cleanSearch) ||
        sanitizeText(pet.raza).includes(cleanSearch) ||
        sanitizeText(pet.ubicacion).includes(cleanSearch),
    );
  }, [pets, searchTerm]);

  return (
    <AdopterLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: "text.secondary", textTransform: "none" }}
      >
        Volver
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Explorar Mascotas
        </Typography>
        <Typography color="text.secondary">
          Descubre a todos los rescataditos que están listos para recibir amor
          en un nuevo hogar.
        </Typography>
      </Box>

      {/* RHF + Zod Search Filter Molecule */}
      <PetSearchFilter onSearchChange={setSearchTerm} />

      {/* Network State Handling Feedbacks */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={40} color="primary" />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          Hubo un error de conexión al cargar el catálogo de mascotas. Por
          favor, intenta de nuevo.
        </Alert>
      )}

      {/* Render Grid Organism Flow */}
      {!isLoading && !isError && (
        <>
          {filteredPets.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <PetsIcon sx={{ fontSize: 64, color: "grey.300" }} />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                No se encontraron mascotas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intenta ajustando el nombre, la raza o la ubicación de tu
                búsqueda.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredPets.map((pet: Pet) => (
                <Grid item xs={12} sm={6} lg={4} key={pet.id}>
                  <PetCard
                    // FIX 2: Added the required ID for the "View Profile" button to work
                    id={pet.id}
                    nombre={pet.nombre}
                    raza={pet.raza}
                    edad={pet.edad}
                    genero={pet.genero}
                    ubicacion={pet.ubicacion}
                    imagen={pet.imagen}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </AdopterLayout>
  );
};
