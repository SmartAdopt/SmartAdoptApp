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

      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};
