// src/components/templates/AdminLayout.tsx

import { Box, Container } from "@mui/material";
import { type ReactNode } from "react";
import { AdminNavbar } from "../organisms/AdminNavbar";
import { useAppSocketIO } from "../../hooks/useAppSocketIO";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Initialize Socket.IO connection for admin panel
  useAppSocketIO();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      <AdminNavbar />

      <Box component="main" sx={{ py: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};
