// src/components/organisms/LeftAuthSidebar.tsx

import { Box } from "@mui/material";
import { Logo } from "../atoms/Logo";
import { FeatureInfoCard } from "../molecules/FeatureInfoCard";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

export const LeftAuthSidebar = () => {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", pt: 4 }}
    >
      <Box sx={{ mb: 8 }}>
        <Logo />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FeatureInfoCard
          icon={<img src={PUBLIC_ASSETS.adopt} width={20} alt="icon" />}
          title="Para Adoptantes"
          description="Encuentra tu compañero perfecto mediante emparejamiento con IA y un proceso de adopción sin complicaciones"
          borderColor="primary.light"
          iconBgColor="primary.main"
        />

        <FeatureInfoCard
          icon={
            <img
              src={PUBLIC_ASSETS.heart}
              width={20}
              alt="icon"
              style={{ filter: "grayscale(100%) brightness(50%)" }}
            />
          }
          title="Plataforma Confiable"
          description="Ayudando a organizaciones de rescate en todo Ecuador a conectar hogares amorosos con animales necesitados"
          borderColor="#FDE68A" // Light yellow/orange
          iconBgColor="#FFFBEB"
        />
      </Box>
    </Box>
  );
};
