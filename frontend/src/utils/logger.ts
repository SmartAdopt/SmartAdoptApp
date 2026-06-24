// src/utils/logger.ts

/**
 * Centralized logger for the frontend.
 * Mimics the structure and levels of the backend (Loguru)
 * to maintain a synchronized and standardized log format.
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

const formatMessage = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] Frontend - ${message}`;
};

export const logger = {
  info: (message: string, ...optionalParams: unknown[]) => {
    console.info(formatMessage("INFO", message), ...optionalParams);
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    console.warn(formatMessage("WARN", message), ...optionalParams);
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    console.error(formatMessage("ERROR", message), ...optionalParams);
  },
  debug: (message: string, ...optionalParams: unknown[]) => {
    // Note: console.debug is often hidden by default in browser devtools
    console.debug(formatMessage("DEBUG", message), ...optionalParams);
  },
};
