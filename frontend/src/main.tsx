// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App.tsx";
import { theme } from "./theme/theme";
import "./index.css"; // Optional: Keep for utility classes if needed

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Provides the MUI theme to all child components */}
    <ThemeProvider theme={theme}>
      {/* Normalizes browser styles */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
