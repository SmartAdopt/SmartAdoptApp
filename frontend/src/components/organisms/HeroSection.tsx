// src/components/organisms/HeroSection.tsx

import { Box, Typography, Container } from "@mui/material";
import { CategoryButton } from "../molecules/CategoryButton";

// Placeholder image matching the vibe of the prototype
const HERO_BG_URL =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80";

export const HeroSection = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: 8,
      }}
    >
      {/* Background Image Area with dark overlay */}
      <Box
        sx={{
          width: "100%",
          height: "60vh",
          minHeight: 450,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${HERO_BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h1"
            color="white"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: {
                xs: "2rem",
                md: "3.5rem",
              },
            }}
          >
            Encuentra a tu Nuevo Mejor Amigo y Adopta una Mascota
          </Typography>
          <Typography
            variant="h6"
            color="grey.200"
            sx={{ fontWeight: 400, mb: 2 }}
          >
            Miles de perros, gatos y otros animales esperan por ti
          </Typography>
        </Container>
      </Box>

      {/* Overlapping Category Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          marginTop: "-60px", // This creates the overlapping effect from the prototype
          zIndex: 2,
        }}
      >
        <CategoryButton
          title="Perros"
          icon={<img src="/dog.svg" width={32} />}
          color="primary"
        />
        <CategoryButton
          title="Gatos"
          icon={<img src="/cat.svg" width={32} />}
          color="success"
        />
      </Box>
    </Box>
  );
};
