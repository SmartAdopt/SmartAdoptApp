// src/routes/AppRouter.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// ==============================
// PUBLIC PAGES
// ==============================
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// ==============================
// PROTECTED PAGES (Domain Folders)
// ==============================
import { AdopterDashboard } from "../pages/adopter/AdopterDashboard";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdopterProfile } from "../pages/adopter/AdopterProfile";

export const AppRouter = () => {
  return (
    <Routes>
      {/* ==============================
          PUBLIC ROUTES
          Accessible to all unauthenticated users
          ============================== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ==============================
          PRIVATE ROUTES (Adopter)
          Requires a valid user session
          ============================== */}
      <Route element={<ProtectedRoute />}>
        {/* Adopter Main Feed / Dashboard */}
        <Route path="/adopter/dashboard" element={<AdopterDashboard />} />
        
        {/* Adopter Profile Settings */}
        <Route path="/adopter/profile" element={<AdopterProfile />} />
      </Route>

      {/* ==============================
          PRIVATE ROUTES (Admin)
          Requires a valid session AND 'admin' role
          ============================== */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        {/* Foundation Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* ==============================
          FALLBACK ROUTE
          Redirects unknown URLs to the Landing Page
          ============================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};