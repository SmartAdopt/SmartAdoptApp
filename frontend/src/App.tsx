// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

// Configuración del Tema
import { theme } from "./theme/theme";

// Proveedores y Enrutador Global
import { AuthProvider } from "./context/AuthProvider";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza estilos globales y aplica el fondo del tema */}
      <CssBaseline /> 
      
      <AuthProvider>
        <BrowserRouter>
          {/* ¡Toda la lógica de rutas vive ahora dentro de AppRouter! 
            App.tsx se mantiene limpio, inyectando solo dependencias globales.
          */}
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;