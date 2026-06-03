// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ==============================
              RUTAS PÚBLICAS
              Cualquiera puede verlas sin login
          ============================== */}
          <Route path="/" element={<HomePage />} />{" "}
          {/* ¡Esta es tu Landing Page! */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* ==============================
              RUTAS PRIVADAS (Adopter)
              Requieren estar logueado
          ============================== */}
          <Route element={<ProtectedRoute />}>
            {/* Aquí irán las vistas internas cuando el adoptante inicie sesión */}
            <Route
              path="/adopter/profile"
              element={<div>Perfil del Adoptante</div>}
            />
          </Route>
          {/* ==============================
              RUTAS PRIVADAS (Admin)
              Requieren estar logueado y ser Admin
          ============================== */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
          {/* Fallback route: Si escriben una URL que no existe, van al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
