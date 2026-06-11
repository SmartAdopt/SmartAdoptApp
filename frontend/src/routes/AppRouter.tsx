// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// ==============================
// PUBLIC PAGES (Fallo lógico corregido: Estandarizado a Named Imports)
// ==============================
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

// ==============================
// PROTECTED PAGES
// ==============================
import { AdopterDashboard } from "../pages/adopter/AdopterDashboard";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdopterProfile } from "../pages/adopter/AdopterProfile";
import { AdopterExplore } from "../pages/adopter/AdopterExplore";
import { AdopterRequests } from "../pages/adopter/AdopterRequests";
import { AdopterFavorites } from "../pages/adopter/AdopterFavorites";
import { AdopterSuitability } from "../pages/adopter/AdopterSuitability";

export const AppRouter = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PRIVATE ROUTES (Adopter) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/adopter/dashboard" element={<AdopterDashboard />} />
        <Route path="/adopter/explore" element={<AdopterExplore />} />
        <Route path="/adopter/requests" element={<AdopterRequests />} />
        <Route path="/adopter/favorites" element={<AdopterFavorites />} />
        <Route path="/adopter/suitability" element={<AdopterSuitability />} />
        <Route path="/adopter/profile" element={<AdopterProfile />} />
      </Route>

      {/* PRIVATE ROUTES (Admin) */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};