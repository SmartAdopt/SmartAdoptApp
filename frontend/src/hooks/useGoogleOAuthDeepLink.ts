import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { logger } from "../utils/logger";

export const useGoogleOAuthDeepLink = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const authListener = CapacitorApp.addListener(
      "appUrlOpen",
      async (event) => {
        // The deep link URL from the backend redirect
        const url = event.url;
        logger.info(`Received appUrlOpen event with url: ${url}`);

        if (url.includes("oauth-callback")) {
          // We received the OAuth callback from the backend!

          // Small delay before closing to ensure the system handles the intent switch smoothly
          setTimeout(async () => {
            await Browser.close();
          }, 500);

          // Parse the URL params
          // Fix hash router handling if needed, but URL() should parse correctly since it's a deep link
          // e.g. net.programacionwebuce.smartadopt://oauth-callback?access_token=...
          const urlParams = new URL(url);

          const access_token = urlParams.searchParams.get("access_token");
          const refresh_token = urlParams.searchParams.get("refresh_token");
          const role = urlParams.searchParams.get("role");
          const id = urlParams.searchParams.get("id");
          const first_name = urlParams.searchParams.get("first_name");
          const last_name = urlParams.searchParams.get("last_name");
          const email = urlParams.searchParams.get("email");
          const phone_number = urlParams.searchParams.get("phone_number");

          if (access_token && role) {
            // 1. Save tokens securely
            localStorage.setItem("access_token", access_token);
            if (refresh_token) {
              localStorage.setItem("refresh_token", refresh_token);
            }

            // 2. Format the user session to match Context interface
            const sessionData = {
              id: id ? parseInt(id, 10) : 0,
              name: `${first_name || ""} ${last_name || ""}`.trim(),
              email: email || "",
              phone_number: phone_number || undefined,
              role: role as "admin" | "adopter" | "user",
            };

            // 3. Log the user in globally
            loginUser(sessionData);

            // 4. Redirect explicitly guarantees user is moved to dashboard
            if (role.toLowerCase() === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/adopter/dashboard", { replace: true });
            }
          }
        }
      }
    );

    return () => {
      authListener.then((listener) => listener.remove());
    };
  }, [loginUser, navigate]);
};
