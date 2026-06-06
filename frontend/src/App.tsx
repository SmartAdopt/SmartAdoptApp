// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
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
              PUBLIC ROUTES
              Anyone can view them without logging in
            ============================== */}
          <Route path="/" element={<HomePage />} />{" "}
          {/* This is your Landing Page! */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
            {/* ==============================
              PRIVATE ROUTES (Adopter)
              Require being logged in
            ============================== */}
          <Route element={<ProtectedRoute />}>
            {/* Internal views will go here when the adopter logs in */}
            <Route
              path="/adopter/profile"
              element={<div>Perfil del Adoptante</div>}
            />
          </Route>
            {/* ==============================
              PRIVATE ROUTES (Admin)
              Require being logged in and having the Admin role
            ============================== */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
          {/* Fallback route: If they enter a URL that does not exist, send them home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
