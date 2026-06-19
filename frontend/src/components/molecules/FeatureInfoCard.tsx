// src/components/molecules/FeatureInfoCard.tsx

import { Paper, Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface FeatureInfoCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  borderColor?: string;
  iconBgColor?: string;
}

export const FeatureInfoCard = ({
  icon,
  title,
  description,
  borderColor = "primary.light",
  iconBgColor = "primary.main",
}: FeatureInfoCardProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: borderColor,
        bgcolor: "background.paper",
        display: "flex",
        gap: 2,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
      }}
    >
      <Box
        sx={{
          bgcolor: iconBgColor,
          color: "white",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.5 }}
        >
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};
