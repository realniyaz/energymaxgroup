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
    } else {
      localStorage.removeItem("customer_session_token");
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

// Request Interceptor: Injects X-Customer-Session-Token header
customerClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCustomerSessionToken();
    if (token && config.headers) {
      config.headers["X-Customer-Session-Token"] = token;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Catches session expiration
customerClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isAuthRoute =
        error.config?.url?.includes("/customer/auth/login") ||
        error.config?.url?.includes("/customer/auth/otp");

      if (!isAuthRoute) {
        setCustomerSessionToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export default customerClient;