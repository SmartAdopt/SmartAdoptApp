// src/services/apiClient.ts
import axios from "axios";

// Base URL is handled via environment variables (e.g., .env.development)
// Fallback matches the SA-37 contract for local Docker environments
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create a centralized Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token exactly as defined in the SA-37 contract
    const token = localStorage.getItem("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle global API errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "🚨 INTERCEPTOR DETECTÓ UN 401 EN LA RUTA:",
        error.config?.url,
      );
      console.warn(
        "🚨 Token enviado en esta petición:",
        error.config?.headers?.Authorization,
      );

      // localStorage.removeItem("access_token");
      // localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);
