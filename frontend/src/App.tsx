// src/App.tsx

import { BrowserRouter, HashRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // <-- NEW: TanStack Core Imports

// Theme configuration
import { theme } from "./theme/theme";

// Providers and Global Router
import { AuthProvider } from "./context/AuthContext";
import { PetProvider } from "./context/PetContext"; // <-- NEW: Global State Sync Context
import { AppRouter } from "./routes/AppRouter";

// Initialize TanStack Query Cache client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive background refetching in development
    },
  },
});
const Router =
  window.location.protocol === "file:" ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <PetProvider>
            {" "}
            {/* <-- NEW: Integrated custom client database provider */}
            <Router>
              <AppRouter />
            </Router>
          </PetProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
