// lib/affiliate-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://energymax-backend.onrender.com";

export const affiliateClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let inMemoryAffiliateToken: string | null = null;

if (typeof window !== "undefined") {
  inMemoryAffiliateToken = localStorage.getItem("affiliate_access_token");
}

export function setAffiliateAccessToken(token: string | null) {
  inMemoryAffiliateToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("affiliate_access_token", token);
      affiliateClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("affiliate_access_token");
      delete affiliateClient.defaults.headers.common["Authorization"];
    }
  }
}

export function getAffiliateAccessToken(): string | null {
  if (inMemoryAffiliateToken) return inMemoryAffiliateToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("affiliate_access_token");
  }
  return null;
}

// Request Interceptor: Injects Bearer token
affiliateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAffiliateAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Catches 401s on protected affiliate routes
affiliateClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isAuthRoute =
        error.config?.url?.includes("/affiliates/auth/login") ||
        error.config?.url?.includes("/affiliates/auth/activate");

      const pathname = window.location.pathname;

      if (!isAuthRoute && pathname.startsWith("/affiliate")) {
        setAffiliateAccessToken(null);
        window.location.href = "/affiliate/login";
      }
    }
    return Promise.reject(error);
  }
);

export default affiliateClient;