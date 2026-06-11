// src/components/templates/AdopterLayout.tsx

import {
  Box,
} from "@mui/material";

import { type ReactNode } from "react";

import { AdopterSidebar } from "../organisms/AdopterSidebar";

interface AdopterLayoutProps {
  children: ReactNode;
}

export const AdopterLayout = ({
  children,
}: AdopterLayoutProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
      }}
    >
      <AdopterSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};