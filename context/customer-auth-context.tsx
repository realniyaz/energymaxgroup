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
import {
  requestPasswordResetOTP,
  resendPasswordResetOTP,
  confirmPasswordResetOTP,
  resetCustomerPassword,
  RecoveryMethod,
} from "@/lib/services/forgotPasswordService";

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
  requestPasswordRecovery: (method: RecoveryMethod, identifier: string) => Promise<string>;
  resendPasswordRecovery: (method: RecoveryMethod, identifier: string) => Promise<string>;
  confirmPasswordRecoveryOtp: (
    method: RecoveryMethod,
    identifier: string,
    code: string
  ) => Promise<{ reset_token: string; expires_at: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<string>;
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

  const triggerGuestCartMerge = useCallback(async () => {
    try {
      const guestToken = getGuestCartToken();
      if (!guestToken) return;

      await customerClient.post(
        "/api/v1/shop/customer/cart/merge",
        {},
        {
          headers: {
            "X-Guest-Cart-Token": guestToken,
          },
        }
      );

      setGuestCartToken(null);
    } catch (err) {
      console.warn("Guest cart merge skipped or non-critical failure:", err);
    }
  }, []);

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

        await triggerGuestCartMerge();
        return user;
      } finally {
        setLoading(false);
      }
    },
    [triggerGuestCartMerge]
  );

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

        await triggerGuestCartMerge();
        return user;
      } finally {
        setLoading(false);
      }
    },
    [triggerGuestCartMerge]
  );

  // --- Password Recovery Actions ---
  const requestPasswordRecovery = useCallback(
    async (method: RecoveryMethod, identifier: string) => {
      const res = await requestPasswordResetOTP({ method, identifier });
      return res.message;
    },
    []
  );

  const resendPasswordRecovery = useCallback(
    async (method: RecoveryMethod, identifier: string) => {
      const res = await resendPasswordResetOTP({ method, identifier });
      return res.message;
    },
    []
  );

  const confirmPasswordRecoveryOtp = useCallback(
    async (method: RecoveryMethod, identifier: string, code: string) => {
      const res = await confirmPasswordResetOTP({ method, identifier, code });
      return { reset_token: res.reset_token, expires_at: res.expires_at };
    },
    []
  );

  const resetPassword = useCallback(
    async (resetToken: string, newPassword: string) => {
      const res = await resetCustomerPassword({
        reset_token: resetToken,
        new_password: newPassword,
      });
      return res.message;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await customerClient.post("/api/v1/shop/customer/auth/logout");
    } catch {
      // Continue cleanup
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
      requestPasswordRecovery,
      resendPasswordRecovery,
      confirmPasswordRecoveryOtp,
      resetPassword,
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
      requestPasswordRecovery,
      resendPasswordRecovery,
      confirmPasswordRecoveryOtp,
      resetPassword,
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