// lib/affiliate-tracking.ts

export interface StoredReferralData {
  affiliateCode: string | null;
  trackingToken: string | null;
}

const AFFILIATE_CODE_KEY = "em_affiliate_code";
const AFFILIATE_TOKEN_KEY = "em_affiliate_token";
const ATTRIBUTION_WINDOW_DAYS = 30;

function setSecureCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? ";Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Capture referral code and tracking token from URL query string on client mount.
 * Sets both 30-day first-party cookies and localStorage entries.
 */
export function captureReferralToken(): StoredReferralData {
  if (typeof window === "undefined") {
    return { affiliateCode: null, trackingToken: null };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const ref =
    urlParams.get("ref") ||
    urlParams.get("aff") ||
    urlParams.get("referral");
  const token =
    urlParams.get("ref_token") ||
    urlParams.get("token") ||
    urlParams.get("aff_token");

  if (ref && ref.trim()) {
    const normalizedCode = ref.trim().toUpperCase();
    setSecureCookie(AFFILIATE_CODE_KEY, normalizedCode, ATTRIBUTION_WINDOW_DAYS);
    try {
      localStorage.setItem(AFFILIATE_CODE_KEY, normalizedCode);
    } catch {}
  }

  if (token && token.trim()) {
    const cleanToken = token.trim();
    setSecureCookie(AFFILIATE_TOKEN_KEY, cleanToken, ATTRIBUTION_WINDOW_DAYS);
    try {
      localStorage.setItem(AFFILIATE_TOKEN_KEY, cleanToken);
    } catch {}
  }

  return getStoredReferralData();
}

/**
 * Retrieve the active persisted affiliate tracking tokens from cookies or localStorage.
 */
export function getStoredReferralData(): StoredReferralData {
  if (typeof document === "undefined") {
    return { affiliateCode: null, trackingToken: null };
  }

  let affiliateCode = getCookie(AFFILIATE_CODE_KEY);
  let trackingToken = getCookie(AFFILIATE_TOKEN_KEY);

  try {
    if (!affiliateCode) {
      affiliateCode = localStorage.getItem(AFFILIATE_CODE_KEY);
    }
    if (!trackingToken) {
      trackingToken = localStorage.getItem(AFFILIATE_TOKEN_KEY);
    }
  } catch {}

  return {
    affiliateCode: affiliateCode ? affiliateCode.trim() : null,
    trackingToken: trackingToken ? trackingToken.trim() : null,
  };
}

/**
 * Clears stored referral data after attribution or customer checkout completion.
 */
export function clearStoredReferralData(): void {
  if (typeof document === "undefined") return;

  setSecureCookie(AFFILIATE_CODE_KEY, "", -1);
  setSecureCookie(AFFILIATE_TOKEN_KEY, "", -1);

  try {
    localStorage.removeItem(AFFILIATE_CODE_KEY);
    localStorage.removeItem(AFFILIATE_TOKEN_KEY);
  } catch {}
}