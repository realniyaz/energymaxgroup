// lib/customer-client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://energymax-backend.onrender.com";

export const customerClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000,
});

let inMemoryCustomerToken: string | null = null;

if (typeof window !== "undefined") {
  inMemoryCustomerToken = localStorage.getItem("customer_session_token");
}

export function setCustomerSessionToken(token: string | null) {
  inMemoryCustomerToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("customer_session_token", token);
      customerClient.defaults.headers.common["X-Customer-Session-Token"] = token;
    } else {
      localStorage.removeItem("customer_session_token");
      delete customerClient.defaults.headers.common["X-Customer-Session-Token"];
    }
  }
}

export function getCustomerSessionToken(): string | null {
  if (inMemoryCustomerToken) return inMemoryCustomerToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("customer_session_token");
  }
  return null;
}

// Request Interceptor: Injects X-Customer-Session-Token header & strips accidental admin tokens
customerClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCustomerSessionToken();

    // Prevent admin Bearer tokens from leaking into customer requests
    if (config.headers["Authorization"]) {
      delete config.headers["Authorization"];
    }

    if (token && config.headers) {
      config.headers["X-Customer-Session-Token"] = token;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Catches session expiration cleanly
customerClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url || "";
      const isAuthRoute =
        url.includes("/customer/auth/login") ||
        url.includes("/customer/auth/otp") ||
        url.includes("/customer/auth/forgot-password");

      // Only purge token on actual session failures, never during auth checks/retries
      if (!isAuthRoute) {
        setCustomerSessionToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export default customerClient;