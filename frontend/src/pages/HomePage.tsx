// src/pages/HomePage.tsx
import { Box } from "@mui/material";
import { Navbar } from "../components/organisms/Navbar";
import { HeroSection } from "../components/organisms/HeroSection";
import { HowItWorksSection } from "../components/organisms/HowItWorksSection";
import { ImpactSection } from "../components/organisms/ImpactSection";
import { Footer } from "../components/organisms/Footer";

export const HomePage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Main content that pushes the footer down when there is little content */}
      <Box sx={{ flexGrow: 1 }}>
        <HeroSection />
        <HowItWorksSection />
        <ImpactSection />
      </Box>

      <Footer />
    </Box>
  );
};

 