// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

// Define the global theme based on SmartAdopt prototypes
export const theme = createTheme({
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
    // Override default MUI button styles for consistency
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 24px",
          boxShadow: "none", // Flat design as seen in prototypes
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
  },
});
