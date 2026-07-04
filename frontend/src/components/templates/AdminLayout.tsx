// src/components/templates/AdminLayout.tsx

import { Box, Container } from "@mui/material";
import { type ReactNode } from "react";
import { AdminNavbar } from "../organisms/AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      <AdminNavbar />

      <Box component="main" sx={{ py: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};
