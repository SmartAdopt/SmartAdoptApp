const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const resolveRuntimeFallbackApiUrl = (): string => {
  if (typeof window !== "undefined" && window.location.protocol === "file:") {
    // Packaged Electron app loads from file://, so relative /api would break.
    return "http://localhost:8000/api";
  }

  return "/api";
};

const envApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = trimTrailingSlash(
  envApiUrl && envApiUrl.length > 0
    ? envApiUrl
    : resolveRuntimeFallbackApiUrl(),
);
