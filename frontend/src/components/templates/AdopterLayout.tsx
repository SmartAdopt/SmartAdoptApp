// src/components/templates/AdopterLayout.tsx

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { type ReactNode, useState } from "react";
import { AdopterSidebar } from "../organisms/AdopterSidebar";
import { Logo } from "../atoms/Logo";

interface AdopterLayoutProps {
  children: ReactNode;
}

export const AdopterLayout = ({ children }: AdopterLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    </Box>
  );
};
