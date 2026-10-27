// lib/affiliate-tracking.ts

export interface StoredReferralData {
  affiliateCode: string | null;
  trackingToken: string | null;
}

export function getStoredReferralData(): StoredReferralData {
  if (typeof document === "undefined") {
    return { affiliateCode: null, trackingToken: null };
  }

  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  let affiliateCode = getCookie("em_affiliate_code");
  let trackingToken = getCookie("em_affiliate_token");

  try {
    if (!affiliateCode) {
      affiliateCode = localStorage.getItem("em_affiliate_code");
    }
    if (!trackingToken) {
      trackingToken = localStorage.getItem("em_affiliate_token");
    }
  } catch {
    // Local storage access prevented
  }

  return {
    affiliateCode: affiliateCode || null,
    trackingToken: trackingToken || null,
  };
}