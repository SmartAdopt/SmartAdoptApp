// src/components/organisms/HeroSection.tsx
// JAMstack — Markup Layer
// Content is imported from a static JSON file and bundled at build time by Vite.
// This decouples content from presentation, simulating a Headless CMS approach.

import { Box, Typography, Container } from "@mui/material";
import { CategoryButton } from "../molecules/CategoryButton";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

// Static JSON import — Vite inlines this at build time (pre-rendered markup).
import landingData from "../../content/landing.json";

// Type-safe mapping from the JSON assetKey strings to the actual asset imports.
const assetMap: Record<string, string> = {
  dog: PUBLIC_ASSETS.dog,
  cat: PUBLIC_ASSETS.cat,
  adopt: PUBLIC_ASSETS.adopt,
  logo: PUBLIC_ASSETS.logo,
};

export const HeroSection = () => {
  const { hero } = landingData;

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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${hero.backgroundImageUrl})`,
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
            {hero.title}
          </Typography>
          <Typography
            variant="h6"
            color="grey.200"
            sx={{ fontWeight: 400, mb: 2 }}
          >
            {hero.subtitle}
          </Typography>
        </Container>
      </Box>

      {/* Overlapping Category Buttons — driven by static JSON data */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          marginTop: "-60px", // This creates the overlapping effect from the prototype
          zIndex: 2,
        }}
      >
        {hero.categories.map((category) => (
          <CategoryButton
            key={category.id}
            title={category.title}
            icon={
              <img
                src={assetMap[category.assetKey]}
                width={32}
                alt={category.title}
              />
            }
            color={category.color as "primary" | "success"}
          />
        ))}
      </Box>
    </Box>
  );
};
