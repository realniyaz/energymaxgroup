// lib/affiliate-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://energymax-backend.onrender.com";

export const affiliateClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getAffiliateAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("affiliate_access_token");
}

export function setAffiliateAccessToken(token: string | null) {
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

// Request Interceptor: Always attach the latest token directly from storage
affiliateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAffiliateAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Only redirect on 401 if not already on the login page
affiliateClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const isAuthRoute =
        pathname.includes("/affiliate/login") ||
        pathname.includes("/affiliate/activate") ||
        pathname.includes("/affiliates/apply");

      // Clear stale token
      setAffiliateAccessToken(null);

      // Only redirect if actively inside protected affiliate pages and not already logging in
      if (!isAuthRoute && pathname.startsWith("/affiliate")) {
        window.location.href = "/affiliate/login";
      }
    }
    return Promise.reject(error);
  }
);

export default affiliateClient;