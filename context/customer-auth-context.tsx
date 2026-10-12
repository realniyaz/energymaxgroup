// context/customer-auth-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  customerClient,
  setCustomerSessionToken,
  getCustomerSessionToken,
} from "@/lib/customer-client";
import { getGuestCartToken, setGuestCartToken } from "@/lib/guest-client";

export interface CustomerUser {
  id?: number;
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
  created_at?: string;
}

export interface CustomerRegisterPayload {
  username: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  password: string;
}

export interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<CustomerUser>;
  registerCustomer: (data: CustomerRegisterPayload) => Promise<CustomerUser>;
  requestOtp: (
    destination: string,
    channel?: "email" | "sms",
    purpose?: "login" | "registration" | "password_reset"
  ) => Promise<{ message: string; expires_at?: string }>;
  verifyOtp: (
    destination: string,
    code: string,
    channel?: "email" | "sms",
    purpose?: "login" | "registration" | "password_reset"
  ) => Promise<CustomerUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<CustomerUser | null>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined
);

export const CustomerAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Automatically merge anonymous guest cart items into the newly 
   * authenticated customer cart upon login/OTP verification.
   */
  const triggerGuestCartMerge = useCallback(async () => {
    try {
      const guestToken = getGuestCartToken();
      if (!guestToken) return;

      // Both X-Customer-Session-Token and X-Guest-Cart-Token headers are handled
      await customerClient.post(
        "/api/v1/shop/customer/cart/merge",
        {},
        {
          headers: {
            "X-Guest-Cart-Token": guestToken,
          },
        }
      );

      // Once merged, destroy the temporary guest token
      setGuestCartToken(null);
    } catch (err) {
      console.warn("Guest cart merge skipped or non-critical failure:", err);
    }
  }, []);

  /**
   * Hydrates customer profile on boot using stored session token.
   */
  const refreshProfile = useCallback(async (): Promise<CustomerUser | null> => {
    const token = getCustomerSessionToken();
    if (!token) {
      setCustomer(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await customerClient.get<CustomerUser>(
        "/api/v1/shop/customer/profile"
      );
      setCustomer(res.data);
      return res.data;
    } catch {
      // Invalidate if token expired or is revoked on the backend
      setCustomerSessionToken(null);
      setCustomer(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  /**
   * Standard Password Login
   * POST /api/v1/shop/customer/auth/login
   */
  const loginWithPassword = useCallback(
    async (identifier: string, password: string): Promise<CustomerUser> => {
      setLoading(true);
      try {
        const res = await customerClient.post<{
          customer: CustomerUser;
          session_token: string;
        }>("/api/v1/shop/customer/auth/login", {
          identifier: identifier.trim(),
          password,
        });

        const { customer: user, session_token } = res.data;
        setCustomerSessionToken(session_token);
        setCustomer(user);

        // Merge any existing guest cart
        await triggerGuestCartMerge();

        return user;
      } finally {
        setLoading(false);
      }
    },
    [triggerGuestCartMerge]
  );

  /**
   * Customer Registration
   * POST /api/v1/shop/customer/auth/register
   * Note: Backend returns the unverified user object without a session token.
   */
  const registerCustomer = useCallback(
    async (data: CustomerRegisterPayload): Promise<CustomerUser> => {
      setLoading(true);
      try {
        const res = await customerClient.post<CustomerUser>(
          "/api/v1/shop/customer/auth/register",
          {
            username: data.username.trim(),
            first_name: data.first_name.trim(),
            last_name: data.last_name?.trim() || undefined,
            email: data.email.trim().toLowerCase(),
            phone: data.phone?.trim() || undefined,
            password: data.password,
          }
        );

        return res.data;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Request OTP Code (Email/SMS)
   * POST /api/v1/shop/customer/auth/otp/request
   */
  const requestOtp = useCallback(
    async (
      destination: string,
      channel: "email" | "sms" = "email",
      purpose: "login" | "registration" | "password_reset" = "login"
    ) => {
      const res = await customerClient.post<{
        message: string;
        expires_at?: string;
      }>("/api/v1/shop/customer/auth/otp/request", {
        destination: destination.trim(),
        channel,
        purpose,
      });

      return res.data;
    },
    []
  );

  /**
   * Verify OTP Code and establish authenticated customer session
   * POST /api/v1/shop/customer/auth/otp/verify
   */
  const verifyOtp = useCallback(
    async (
      destination: string,
      code: string,
      channel: "email" | "sms" = "email",
      purpose: "login" | "registration" | "password_reset" = "login"
    ): Promise<CustomerUser> => {
      setLoading(true);
      try {
        const res = await customerClient.post<{
          customer: CustomerUser;
          session_token: string;
        }>("/api/v1/shop/customer/auth/otp/verify", {
          destination: destination.trim(),
          code: code.trim(),
          channel,
          purpose,
        });

        const { customer: user, session_token } = res.data;
        setCustomerSessionToken(session_token);
        setCustomer(user);

        // Merge any existing guest cart
        await triggerGuestCartMerge();

        return user;
      } finally {
        setLoading(false);
      }
    },
    [triggerGuestCartMerge]
  );

  /**
   * Revoke Customer Session
   * POST /api/v1/shop/customer/auth/logout
   */
  const logout = useCallback(async () => {
    try {
      await customerClient.post("/api/v1/shop/customer/auth/logout");
    } catch {
      // Clear client session even if token expired on backend
    } finally {
      setCustomerSessionToken(null);
      setCustomer(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      customer,
      loading,
      isAuthenticated: Boolean(customer && customer.is_active),
      loginWithPassword,
      registerCustomer,
      requestOtp,
      verifyOtp,
      logout,
      refreshProfile,
    }),
    [
      customer,
      loading,
      loginWithPassword,
      registerCustomer,
      requestOtp,
      verifyOtp,
      logout,
      refreshProfile,
    ]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return context;
};