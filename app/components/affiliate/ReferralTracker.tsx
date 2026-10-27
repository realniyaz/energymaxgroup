// components/affiliate/ReferralTracker.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ATTRIBUTION_WINDOW_DAYS = 30;

function setSecureCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? ";Secure" : "";
  
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
}

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const ref = searchParams.get("ref");
    const refToken = searchParams.get("ref_token");

    if (ref && ref.trim()) {
      const normalizedCode = ref.trim().toUpperCase();
      setSecureCookie("em_affiliate_code", normalizedCode, ATTRIBUTION_WINDOW_DAYS);
      try {
        localStorage.setItem("em_affiliate_code", normalizedCode);
      } catch {
        // Handle private browsing storage limitations gracefully
      }
    }

    if (refToken && refToken.trim()) {
      const cleanToken = refToken.trim();
      setSecureCookie("em_affiliate_token", cleanToken, ATTRIBUTION_WINDOW_DAYS);
      try {
        localStorage.setItem("em_affiliate_token", cleanToken);
      } catch {
        // Handle private browsing storage limitations gracefully
      }
    }
  }, [searchParams]);

  return null;
}