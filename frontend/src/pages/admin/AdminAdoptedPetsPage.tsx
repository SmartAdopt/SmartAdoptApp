// src/pages/admin/AdminAdoptedPetsPage.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarTodayIcon,
  FamilyRestroom as FamilyRestroomIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { adoptionFormService } from "../../services/adoptionForm.service";
import { petsService } from "../../services/pets.service";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

interface AdoptedDisplayItem {
  id: string;
  petName: string;
  breed: string;
  age: string;
  petImage: string;
  adopterName: string;
  adoptedDate: string;
}

export const AdminAdoptedPetsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AdoptedDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formData, allPets] = await Promise.all([
          adoptionFormService.getAdminForms("approved"),
          petsService.getRawPetsDatabase(),
        ]);

        const result: AdoptedDisplayItem[] = [];
        for (const form of formData.forms) {
          for (const app of form.applications) {
            if (app.status !== "approved") continue;
            const pet = allPets.find((p) => p.id === app.pet_profile_id);
            result.push({
              id: app.application_id,
              petName: app.pet_name || "Desconocida",
              breed:
                pet?.pet?.animal_breed?.length
                  ? pet.pet.animal_breed.join(", ")
                  : "Desconocida",
              age: pet?.pet?.age ? `${pet.pet.age} años` : "?",
              petImage: pet?.pet?.pet_image_url || PUBLIC_ASSETS.dog,
              adopterName: app.adopter_name || `Usuario #${form.user_id}`,
              adoptedDate: app.reviewed_at
                ? new Date(app.reviewed_at).toLocaleDateString()
                : new Date(app.created_at).toLocaleDateString(),
            });
          }
        }
        setItems(result);
      } catch (error) {
        console.error("Failed to load adopted pets", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/dashboard")}
          sx={{ borderRadius: 2 }}
        >
          Regresar
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Lista de Adoptados
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explora las historias de éxito. Aquí encontrarás todas las mascotas que
        han encontrado un nuevo hogar.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <PetsIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aún no hay mascotas adoptadas
                </Typography>
              </Box>
            </Grid>
          ) : (
            items.map((pet) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={pet.petImage}
                    alt={pet.petName}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {pet.petName}
                      </Typography>
                      <Chip label="Adoptado" color="success" size="small" sx={{ fontWeight: 600 }} />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "text.secondary" }}>
                      <PetsIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {pet.breed} • {pet.age}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Detalles de Adopción
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.light", mr: 1 }}>
                        <FamilyRestroomIcon sx={{ fontSize: 14, color: "primary.dark" }} />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {pet.adopterName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: "success.light", mr: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: "success.dark" }} />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {pet.adoptedDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </AdminLayout>
  );
};
