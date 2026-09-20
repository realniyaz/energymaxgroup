// context/customer-auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CustomerResponse,
  CustomerRegisterPayload,
  CustomerLoginPayload,
  registerCustomer as apiRegister,
  loginCustomer as apiLogin,
  logoutCustomer as apiLogout,
  requestCustomerOTP as apiRequestOtp,
  verifyCustomerOTP as apiVerifyOtp,
} from "@/lib/services/customerAuthService";

interface CustomerAuthContextType {
  customer: CustomerResponse | null;
  sessionToken: string | null;
  loading: boolean;
  loginWithPassword: (payload: CustomerLoginPayload) => Promise<void>;
  register: (payload: CustomerRegisterPayload) => Promise<void>;
  requestOtp: (destination: string, purpose: "login" | "registration" | "password_reset") => Promise<string | null>;
  verifyOtp: (destination: string, code: string, purpose: "login" | "registration" | "password_reset") => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const TOKEN_KEY = "customer_session_token";
const PROFILE_KEY = "customer_profile";

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load persisted session on initial mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedProfile = localStorage.getItem(PROFILE_KEY);

      if (storedToken && storedProfile) {
        setSessionToken(storedToken);
        setCustomer(JSON.parse(storedProfile));
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistSession = useCallback((cust: CustomerResponse, token: string) => {
    setCustomer(cust);
    setSessionToken(token);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(cust));
  }, []);

  const clearSession = useCallback(() => {
    setCustomer(null);
    setSessionToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }, []);

  const loginWithPassword = async (payload: CustomerLoginPayload) => {
    const res = await apiLogin(payload);
    persistSession(res.customer, res.session_token);
    router.push("/shop");
  };

  const register = async (payload: CustomerRegisterPayload) => {
    const res = await apiRegister(payload);
    persistSession(res.customer, res.session_token);
    router.push("/shop");
  };

  const requestOtp = async (
    destination: string,
    purpose: "login" | "registration" | "password_reset"
  ): Promise<string | null> => {
    const res = await apiRequestOtp({
      destination,
      channel: "email",
      purpose,
    });
    return res.expires_at;
  };

  const verifyOtp = async (
    destination: string,
    code: string,
    purpose: "login" | "registration" | "password_reset"
  ) => {
    const res = await apiVerifyOtp({
      destination,
      channel: "email",
      purpose,
      code,
    });
    persistSession(res.customer, res.session_token);
    router.push("/shop");
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Clear client state even if backend session already expired
    } finally {
      clearSession();
      router.push("/shop");
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        sessionToken,
        loading,
        loginWithPassword,
        register,
        requestOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}