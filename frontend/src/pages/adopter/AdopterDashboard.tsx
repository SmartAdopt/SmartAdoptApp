// src/pages/adopter/AdopterDashboard.tsx

import {
  Grid,
  Typography,
  Box,
} from "@mui/material";

import { AdopterLayout } from "../../components/templates/AdopterLayout";

import { QuickActionsPanel } from "../../components/organisms/QuickActionsPanel";
import { FeaturedPetsSection } from "../../components/organisms/FeaturedPetsSection";
import { ArticlesSection } from "../../components/organisms/ArticlesSection";
import { NotificationsPanel } from "../../components/organisms/NotificationsPanel";
import { EventsPanel } from "../../components/organisms/EventsPanel";

import { CommunityImpact } from "../../components/organisms/CommunityImpact";
import { DonationPanel } from "../../components/organisms/DonationPanel";
import { SharePanel } from "../../components/organisms/SharePanel";

export const AdopterDashboard = () => {
  return (
    <AdopterLayout>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
        >
          Bienvenido a SmartAdopt
        </Typography>

        <Typography
          color="text.secondary"
        >
          Encuentra a tu compañero ideal
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <QuickActionsPanel />

          <FeaturedPetsSection />

          <ArticlesSection />

          <CommunityImpact />
        </Grid>

        <Grid item xs={12} lg={4}>
          <NotificationsPanel />

          <EventsPanel />

          <DonationPanel />

          <SharePanel />
        </Grid>
      </Grid>
    </AdopterLayout>
  );
};