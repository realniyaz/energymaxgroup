// lib/api-client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://energymax-backend.onrender.com";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let inMemoryToken: string | null = null;

// Initialize token from localStorage on browser boot
if (typeof window !== "undefined") {
  inMemoryToken = localStorage.getItem("admin_access_token");
}

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("admin_access_token", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("admin_access_token");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }
}

export function setRefreshToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("admin_refresh_token", token);
    } else {
      localStorage.removeItem("admin_refresh_token");
    }
  }
}

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_access_token");
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_refresh_token");
  }
  return null;
}

// Request Interceptor: Injects Authorization header dynamically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Do not override Content-Type if uploading multipart binary FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catches expired sessions and logs detailed errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Print backend detail matrix in browser console for easier debugging
    if (error.response?.data?.detail) {
      console.error("FastAPI Backend Error:", error.response.data.detail);
    }

    // Handle session expiration strictly on protected admin panel routes
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !originalRequest._retry
    ) {
      const pathname = window.location.pathname;
      const isAuthRoute =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh");

      // Scope 401 redirection strictly to /admin routes so storefront pages are never hijacked
      if (
        pathname.startsWith("/admin") &&
        !pathname.includes("/admin/login") &&
        !isAuthRoute
      ) {
        setAccessToken(null);
        setRefreshToken(null);
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;