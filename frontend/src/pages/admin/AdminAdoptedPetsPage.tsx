// src/pages/admin/AdminAdoptedPetsPage.tsx

import React from "react";
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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarTodayIcon,
  FamilyRestroom as FamilyRestroomIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/templates/AdminLayout";
import {
  adoptedPetsService,
  type AdoptedPet,
} from "../../services/adoptedPets.service";

export const AdminAdoptedPetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [adoptedPets] = React.useState<AdoptedPet[]>(() =>
    adoptedPetsService.getAdoptedPets()
  );

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

      <Grid container spacing={3}>
        {adoptedPets.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <PetsIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aún no hay mascotas adoptadas
              </Typography>
            </Box>
          </Grid>
        ) : (
          adoptedPets.map((pet) => (
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
                  image={pet.image}
                  alt={pet.petName}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {pet.petName}
                    </Typography>
                    <Chip
                      label="Adoptado"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      color: "text.secondary",
                    }}
                  >
                    <PetsIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {pet.breed} • {pet.age}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Detalles de Adopción
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: "primary.light",
                        mr: 1,
                      }}
                    >
                      <FamilyRestroomIcon
                        sx={{ fontSize: 14, color: "primary.dark" }}
                      />
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {pet.newFamily}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: pet.adopterEmail || pet.adopterPhone ? 1 : 0,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: "success.light",
                        mr: 1,
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{ fontSize: 14, color: "success.dark" }}
                      />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {pet.adoptedDate}
                    </Typography>
                  </Box>

                  {(pet.adopterEmail || pet.adopterPhone) && (
                    <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                  )}

                  {pet.adopterEmail && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: "info.light",
                          mr: 1,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 14, color: "info.dark" }} />
                      </Avatar>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {pet.adopterEmail}
                      </Typography>
                    </Box>
                  )}

                  {pet.adopterPhone && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: "warning.light",
                          mr: 1,
                        }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 14, color: "warning.dark" }}
                        />
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {pet.adopterPhone}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </AdminLayout>
  );
};
