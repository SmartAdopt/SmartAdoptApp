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
  // Fix 1: Changed 'any' to 'unknown' for the rejection reason
  reject: (reason?: unknown) => void;
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
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401, it's not a retry yet, and we are not trying to refresh or login
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/register"
    ) {
      // Always assume a 401 on an authenticated route means we should attempt a refresh.
      // The backend will reject the refresh if the refresh token cookie is invalid/expired.
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

      try {
        // Call the refresh endpoint. Since the backend expects the refresh token
        // in an HTTP-Only cookie, we MUST pass withCredentials: true.
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Empty body because the backend reads the cookie
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data.access_token;

        // Save the new tokens (only access_token is accessible to JS)
        localStorage.setItem("access_token", newAccessToken);

        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
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

    return Promise.reject(error);
  },
);
