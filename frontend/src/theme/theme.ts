// src/theme/theme.ts

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Define the global theme based on SmartAdopt prototypes
let theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB", // Blue used in main buttons and links
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#22C55E", // Green used for the "Cats" button and success metrics
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC", // Light gray background for auth pages
      paper: "#FFFFFF", // White for cards and forms
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none", // Prevents uppercase in buttons by default
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Standard rounded corners for inputs and buttons
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          // Mobile First: Prevent long URLs or continuous strings from breaking the viewport
          wordBreak: "break-word",
          overflowWrap: "break-word",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 24px",
          minHeight: 48, // Touch target mobile-first
          minWidth: 48, // Touch target mobile-first
          boxShadow: "none", // Flat design as seen in prototypes
          whiteSpace: "normal", // Mobile First: Allow button text to wrap instead of overflowing
          textAlign: "center",
          lineHeight: 1.2,
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: 48, // Touch target mobile-first
          minWidth: 48, // Touch target mobile-first
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: "hidden", // Mobile First: Prevent content from spilling horizontally
          maxWidth: "100vw",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          overflow: "hidden", // Mobile First: Container bounds protection
          maxWidth: "100vw",
        },
      },
    },
  },
});

// Apply responsive font sizes (automatically scales h1-h6 down on mobile viewports)
theme = responsiveFontSizes(theme);

export { theme };
