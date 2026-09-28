"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { customerClient, setCustomerSessionToken, getCustomerSessionToken } from "@/lib/customer-client";

export interface CustomerUser {
  public_id: string;
  username: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  registerCustomer: (data: {
    username: string;
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  requestOtp: (destination: string, channel: "email" | "sms", purpose: "login" | "registration" | "password_reset") => Promise<{ message: string; expires_at?: string }>;
  verifyOtp: (destination: string, code: string, channel: "email" | "sms", purpose: "login" | "registration" | "password_reset") => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate customer profile using existing stored session token
  const refreshProfile = useCallback(async () => {
    const token = getCustomerSessionToken();
    if (!token) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    try {
      // Direct customer profile fetch
      const res = await customerClient.get<CustomerUser>("/api/v1/shop/customer/profile");
      setCustomer(res.data);
    } catch {
      // Invalidate if token expired or revoked on backend
      setCustomerSessionToken(null);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Standard Password Login
  const loginWithPassword = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const res = await customerClient.post<{ customer: CustomerUser; session_token: string }>(
        "/api/v1/shop/customer/auth/login",
        { identifier, password }
      );
      setCustomerSessionToken(res.data.session_token);
      setCustomer(res.data.customer);
    } finally {
      setLoading(false);
    }
  };

  // Direct Registration
  const registerCustomer = async (data: {
    username: string;
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const res = await customerClient.post<{ customer: CustomerUser; session_token: string }>(
        "/api/v1/shop/customer/auth/register",
        data
      );
      setCustomerSessionToken(res.data.session_token);
      setCustomer(res.data.customer);
    } finally {
      setLoading(false);
    }
  };

  // OTP Dispatch
  const requestOtp = async (
    destination: string,
    channel: "email" | "sms",
    purpose: "login" | "registration" | "password_reset"
  ) => {
    const res = await customerClient.post<{ message: string; expires_at?: string }>(
      "/api/v1/shop/customer/auth/otp/request",
      { destination, channel, purpose }
    );
    return res.data;
  };

  // OTP Verification
  const verifyOtp = async (
    destination: string,
    code: string,
    channel: "email" | "sms",
    purpose: "login" | "registration" | "password_reset"
  ) => {
    setLoading(true);
    try {
      const res = await customerClient.post<{ customer: CustomerUser; session_token: string }>(
        "/api/v1/shop/customer/auth/otp/verify",
        { destination, code, channel, purpose }
      );
      setCustomerSessionToken(res.data.session_token);
      setCustomer(res.data.customer);
    } finally {
      setLoading(false);
    }
  };

  // Session Revocation
  const logout = async () => {
    try {
      await customerClient.post("/api/v1/shop/customer/auth/logout");
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      setCustomerSessionToken(null);
      setCustomer(null);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        isAuthenticated: !!customer,
        loginWithPassword,
        registerCustomer,
        requestOtp,
        verifyOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};