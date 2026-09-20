// lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://energymax-backend.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// In-memory token references
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("admin_access_token", token);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin_access_token");
    }
  }
}

export function setRefreshToken(token: string | null) {
  inMemoryRefreshToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("refresh_token", token);
      localStorage.setItem("admin_refresh_token", token);
    } else {
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("admin_refresh_token");
    }
  }
}

export function getStoredToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window === "undefined") return null;

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("admin_access_token");

  if (token) return token;

  try {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  } catch {
    // Ignore cookie parsing issues
  }

  return null;
}

export function getStoredRefreshToken(): string | null {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("refresh_token") ||
    localStorage.getItem("admin_refresh_token") ||
    sessionStorage.getItem("refresh_token") ||
    sessionStorage.getItem("admin_refresh_token")
  );
}

// Request Interceptor: Injects Authorization Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Surfaces normalized FastAPI error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    let message = "Network or server error";
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(" | ");
      } else if (data.message) {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default apiClient;