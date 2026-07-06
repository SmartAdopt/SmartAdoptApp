// src/App.tsx

import { BrowserRouter } from "react-router-dom";
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <PetProvider>
            {" "}
            {/* <-- NEW: Integrated custom client database provider */}
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </PetProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
