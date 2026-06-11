// src/components/templates/MainLayout.tsx
import {
  Box,
  AppBar,
  Toolbar,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Atomic Components
import { Logo } from "../atoms/Logo";
import { ProfileMenu } from "../molecules/ProfileMenu";

interface MainLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  userName: string;
}

const DRAWER_WIDTH = 240;

// ENTERPRISE BEST PRACTICE:
// Define sidebar navigation items as a constant array.
// This makes it scalable and easy to maintain when adding new modules.
const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Catálogo de Mascotas", path: "/admin/pets" }, // Molds for future routes
  { label: "Solicitudes", path: "/admin/requests" },
  { label: "Métricas", path: "/admin/metrics" },
];

export const MainLayout = ({
  children,
  isAdmin = false,
  userName,
}: MainLayoutProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* ==============================
          GLOBAL HEADER (AppBar)
          ============================== */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Logo />
          <ProfileMenu userName={userName} />
        </Toolbar>
      </AppBar>

      {/* ==============================
          ADMIN SIDEBAR (Drawer)
          Renders only if the user has Admin privileges
          ============================== */}
      {isAdmin && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <Toolbar /> {/* Spacer to push content below the AppBar */}
          <Box sx={{ overflow: "auto", mt: 2 }}>
            <List>
              {ADMIN_NAV_ITEMS.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton onClick={() => handleNavigation(item.path)}>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* ==============================
          MAIN CONTENT AREA
          Dynamically adjusts width based on Sidebar presence
          ============================== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isAdmin ? DRAWER_WIDTH : 0}px)` },
          transition: "width 0.3s ease", // Smooth transition if state changes
        }}
      >
        <Toolbar /> {/* Spacer to prevent content from hiding behind AppBar */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
