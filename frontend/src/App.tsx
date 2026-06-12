// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

// Theme configuration
import { theme } from "./theme/theme";

// Providers and Global Router
import { AuthProvider } from "./context/AuthContext"; //  
import { AppRouter } from "./routes/AppRouter";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}