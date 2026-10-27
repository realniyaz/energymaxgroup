// context/affiliate-auth-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  AffiliateMeResponse,
  getAffiliateProfile,
  loginAffiliate as apiLogin,
  logoutAffiliate as apiLogout,
} from "@/lib/services/affiliateService";
import {
  getAffiliateAccessToken,
  setAffiliateAccessToken,
} from "@/lib/affiliate-client";

interface AffiliateAuthContextType {
  affiliate: AffiliateMeResponse | null;
  loading: boolean;
  login: (email: string, pass: string, captcha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AffiliateAuthContext = createContext<AffiliateAuthContextType | undefined>(
  undefined
);

export const AffiliateAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [affiliate, setAffiliate] = useState<AffiliateMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    const token = getAffiliateAccessToken();
    // 🛡️ CRITICAL GUARD: Do NOT call /auth/me without a token.
    if (!token) {
      setAffiliate(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getAffiliateProfile();
      setAffiliate(profile);
    } catch {
      setAffiliateAccessToken(null);
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, pass: string, captcha: string) => {
    const res = await apiLogin(email, pass, captcha);
    // Explicitly set token first before updating React state
    setAffiliateAccessToken(res.access_token);
    setAffiliate(res.affiliate);
    router.replace("/affiliate/dashboard");
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Clear local state even if backend network call failed
    } finally {
      setAffiliateAccessToken(null);
      setAffiliate(null);
      router.replace("/affiliate/login");
    }
  };

  return (
    <AffiliateAuthContext.Provider
      value={{
        affiliate,
        loading,
        login,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AffiliateAuthContext.Provider>
  );
};

export const useAffiliateAuth = () => {
  const ctx = useContext(AffiliateAuthContext);
  if (!ctx) {
    throw new Error(
      "useAffiliateAuth must be used within an AffiliateAuthProvider"
    );
  }
  return ctx;
};