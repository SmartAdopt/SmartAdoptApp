// src/components/molecules/SocialLoginGroup.tsx

import { useEffect } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // <-- Fix 1: Added useNavigate
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { SocialButton } from "../atoms/SocialButton";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/apiBaseUrl";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

interface OAuthTokenPayload {
  access_token?: string;
  refresh_token?: string;
  role?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

export const SocialLoginGroup = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate(); // <-- Fix 1: Initialized navigate

  // Cleanup: We removed Apple and Facebook buttons based on UI requirements.
  // We leave Google as the primary SSO method.

  const handleGoogleLogin = async () => {
    // 1. Define the backend OAuth URL
    // Ensure the URL is absolute for Capacitor Browser
    const baseUrl = API_BASE_URL;

    // If baseUrl is relative (e.g., "/api"), it won't work on mobile
    if (Capacitor.isNativePlatform() && baseUrl.startsWith("/")) {
      console.warn("API_BASE_URL is relative. OAuth might fail on mobile. Ensure VITE_API_URL is set correctly during build.");
      // Fallback to a reasonable default if possible, or keep it to show the error
    }

    let url = `${baseUrl}/auth/login/google?role=adopter`;

    // If we are on a native mobile platform, append &platform=mobile and use Capacitor Browser
    if (Capacitor.isNativePlatform()) {
      url += "&platform=mobile";

      // Ensure the URL is absolute for the system browser/Chrome Custom Tabs
      if (url.startsWith("/")) {
        // This is a emergency fallback if VITE_API_URL was missing
        // In a real production app, this should be caught by build-time env validation
        console.error("Cannot open relative URL in native browser. Redirecting to current origin as fallback.");
        url = window.location.origin + url;
      }

      await Browser.open({ url });
    } else {
      // 2. Window features for a centered popup
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // 3. Open the Popup
      window.open(
        url,
        "Google OAuth",
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
    }
  };

  // 4. Listen for the message from the backend callback
  useEffect(() => {
    const handleTokens = (data: OAuthTokenPayload) => {
      if (data && data.access_token && data.role) {
        // We received the tokens!

        // 1. Save tokens securely
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        // 2. Format the user session to match our Context interface
        const sessionData = {
          id: data.id ? parseInt(data.id, 10) : 0,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          email: data.email || "",
          phone_number: data.phone_number,
          role: data.role as "admin" | "adopter" | "user",
        };

        // 3. Log the user in globally
        loginUser(sessionData);

        // 4. Explicit redirect guarantees the user is moved to the dashboard
        const userRole = data.role.toLowerCase();
        if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/adopter/dashboard", { replace: true });
        }
      }
    };

    // Web Implementation: BroadcastChannel
    const channel = new BroadcastChannel("oauth_channel");
    channel.onmessage = (event: MessageEvent) => {
      let data;
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      handleTokens(data);
    };

    // Electron Implementation: IPC listener via contextBridge
    const win = window as unknown as {
      electronAPI?: {
        onOAuthResult: (callback: (data: unknown) => void) => void;
      };
    };
    if (win.electronAPI && win.electronAPI.onOAuthResult) {
      win.electronAPI.onOAuthResult((data: unknown) => {
        let parsedData = data as OAuthTokenPayload;
        if (typeof data === "string") {
          try {
            parsedData = JSON.parse(data);
          } catch {
            // Ignore
          }
        }
        handleTokens(parsedData);
      });
    }

    return () => {
      channel.close();
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
          icon={<img src={PUBLIC_ASSETS.google} width={20} alt="Google" />}
          label="Continuar con Google"
          onClick={handleGoogleLogin}
        />
      </Box>
    </Box>
  );
};
