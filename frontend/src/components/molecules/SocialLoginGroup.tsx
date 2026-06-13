// src/components/molecules/SocialLoginGroup.tsx

import { useEffect } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // <-- Fix 1: Added useNavigate
import { SocialButton } from "../atoms/SocialButton";
import { useAuth } from "../../context/AuthContext";

export const SocialLoginGroup = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate(); // <-- Fix 1: Initialized navigate
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Cleanup: We removed Apple and Facebook buttons based on UI requirements.
  // We leave Google as the primary SSO method.

  const handleGoogleLogin = () => {
    // 1. Define the backend OAuth URL
    // By default, we register OAuth users as "adopter".
    // They can't register as admin via UI without explicit backend database insertion.
    const url = `${API_BASE_URL}/auth/login/google?role=adopter`;

    // 2. Window features for a centered popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // 3. Open the Popup
    const popup = window.open(
      url,
      "Google OAuth",
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );

    // 4. Setup the interval to check if the popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  // 5. Listen for the message from the backend callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: Ensure the message comes from our expected backend origin
      // Note: In local dev, backend might be 8000. In production, it will be your domain.
      // For now, we allow the same origin or localhost:8000

      const isExpectedOrigin =
        event.origin === window.location.origin ||
        event.origin.includes("localhost") ||
        event.origin.includes("127.0.0.1");

      if (!isExpectedOrigin) return;

      // Extract the payload (The JSON returned by /auth/google/callback)
      // Fix 2: Securely parse the event data, as it often arrives as a stringified JSON
      let data;
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return; // Ignore if not a valid JSON message
      }

      if (data && data.access_token && data.role) {
        // We received the tokens!

        // 1. Save tokens securely
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        // 2. Format the user session to match our Context interface
        const sessionData = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`.trim(),
          email: data.email,
          role: data.role,
        };

        // 3. Log the user in globally
        loginUser(sessionData);

        // Fix 3: Explicit redirect guarantees the user is moved to the dashboard
        const userRole = data.role.toLowerCase();
        if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/adopter/dashboard", { replace: true });
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [loginUser, navigate]);

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          O continuar con
        </Typography>
      </Divider>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SocialButton
          icon={<img src="/google.svg" width={20} alt="Google" />}
          label="Continuar con Google"
          onClick={handleGoogleLogin}
        />
      </Box>
    </Box>
  );
};
