// src/components/templates/AdopterLayout.tsx

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { type ReactNode, useState, useEffect } from "react";
import { AdopterSidebar } from "../organisms/AdopterSidebar";
import { Logo } from "../atoms/Logo";
import { useAppSocketIO } from "../../hooks/useAppSocketIO";
import confetti from "canvas-confetti";

interface AdopterLayoutProps {
  children: ReactNode;
}

export const AdopterLayout = ({ children }: AdopterLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");

  const { latestMessage } = useAppSocketIO();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (latestMessage && latestMessage.type === "APPLICATION_STATUS_UPDATE") {
      const isApproved = latestMessage.status === "approved";
      setSnackbarMessage(
        `Tu solicitud ha sido ${isApproved ? "aprobada" : "actualizada"}!`
      );
      setSnackbarSeverity(isApproved ? "success" : "info");
      setSnackbarOpen(true);

      if (isApproved) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#4CAF50", "#FFC107", "#2196F3", "#FF5722"],
        });
      }
    } else if (latestMessage && latestMessage.type === "PET_STATUS_UPDATE") {
      if (latestMessage.status === "Adoptada") {
        setSnackbarMessage(
          `¡Buenas noticias! ${latestMessage.name} acaba de ser adoptado(a) 🎉`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else if (latestMessage.status === "En proceso") {
        setSnackbarMessage(
          `${latestMessage.name} está en proceso de adopción 🐾`
        );
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      }
    } else if (latestMessage && latestMessage.type === "NEW_PET_REGISTERED") {
      setSnackbarMessage(
        `¡Conoce a ${latestMessage.name}! Una nueva mascota ha llegado a SmartAdopt 🐶`
      );
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  }, [latestMessage]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const drawerWidth = 260;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      {/* APP BAR FOR TOGGLE */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
          },
          ml: { md: desktopOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          {/* Show logo in appbar on mobile or when drawer is closed on desktop */}
          {(!desktopOpen || isMobile) && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Logo />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* SIDEBAR DRAWER */}
      <Box
        component="nav"
        sx={{
          width: { md: desktopOpen ? drawerWidth : 0 },
          flexShrink: { md: 0 },
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Mobile temporary drawer */}
        <Drawer
          variant="temporary"
          open={isMobile ? mobileOpen : false}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <AdopterSidebar onClose={handleDrawerToggle} />
        </Drawer>

        {/* Desktop persistent drawer */}
        <Drawer
          variant="persistent"
          open={!isMobile ? desktopOpen : false}
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <AdopterSidebar />
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          pt: 10, // padding top to account for AppBar height
          width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : "100%" },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>

      {/* Global Snackbar for WebSocket Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%", mt: 7 }} // Offset for AppBar
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
