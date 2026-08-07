import axios from "axios";
import { config } from "@/config/config";
import { handleServerError } from "./handle-server-error";

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: (params) => {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
      } else if (value !== undefined && value !== null) {
        parts.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    return parts.join("&");
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const skipAuthRedirect = error.config?.skipAuthRedirect;

    if (status === 401) {
      if (!skipAuthRedirect) {
        const returnUrl = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        );

        window.location.href = `/sign-in?redirect=${returnUrl}`;
      }

      return Promise.reject(error);
    }

    handleServerError(error);
    return Promise.reject(error);
  },
);

// ── Helper: request cancellation ──────────────────────────────────────────

export function abortable() {
  const controller = new AbortController();
  return { controller, signal: controller.signal };
}
