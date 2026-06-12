// src/services/apiClient.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Variables to handle the refresh token queue mechanism
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 and Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401, it's not a retry yet, and we are not trying to refresh the token itself
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      // Check if the backend explicitly says the token expired
      const errorDetail = (error.response.data as any)?.detail;
      const isTokenExpired = errorDetail === "Token expired" || errorDetail === "Could not validate credentials";

      if (isTokenExpired) {
        if (isRefreshing) {
          // If already refreshing, queue this request until the refresh is done
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          // No refresh token available, force logout
          processQueue(new Error("No refresh token available"), null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Call the refresh endpoint (Based on the backend's "Refresh Token.md" plan)
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });

          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token;

          // Save the new tokens
          localStorage.setItem("access_token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
          }

          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          
          // Retry the original request
          return apiClient(originalRequest);

        } catch (refreshError) {
          // If refresh fails (e.g., refresh token expired after 7 days)
          processQueue(refreshError as Error, null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  },
);