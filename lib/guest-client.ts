// lib/guest-client.ts

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://energymax-backend.onrender.com";

export const guestClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let inMemoryGuestToken: string | null = null;

if (typeof window !== "undefined") {
  inMemoryGuestToken = localStorage.getItem("guest_cart_token");
}

export function setGuestCartToken(token: string | null) {
  inMemoryGuestToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("guest_cart_token", token);
    } else {
      localStorage.removeItem("guest_cart_token");
    }
  }
}

export function getGuestCartToken(): string | null {
  if (inMemoryGuestToken) return inMemoryGuestToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("guest_cart_token");
  }
  return null;
}

// Request Interceptor: Attach headers cleanly without polluting catalog requests
guestClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) return config;

    // Never send Admin Authorization Bearer tokens on guestClient
    delete config.headers["Authorization"];

    const url = config.url || "";
    const isCartRoute = url.includes("/cart");

    // Only attach X-Guest-Cart-Token on cart routes
    if (isCartRoute) {
      const guestToken = getGuestCartToken();
      if (guestToken) {
        config.headers["X-Guest-Cart-Token"] = guestToken;
      }
    } else {
      // Explicitly delete so catalog calls are completely pure
      delete config.headers["X-Guest-Cart-Token"];

      // If customer is signed in, pass customer session token in case catalog requires customer visibility
      if (typeof window !== "undefined") {
        const customerToken = localStorage.getItem("customer_session_token");
        if (customerToken) {
          config.headers["X-Customer-Session-Token"] = customerToken;
        }
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
guestClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const returnedToken = response.data?.guest_cart_token;
    if (returnedToken) {
      setGuestCartToken(returnedToken);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // If a guest cart token was revoked, clear it so next request recovers
      setGuestCartToken(null);
    }
    return Promise.reject(error);
  }
);

export default guestClient;