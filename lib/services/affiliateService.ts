// lib/services/affiliateService.ts
import { affiliateClient, setAffiliateAccessToken } from "@/lib/affiliate-client";
import { guestClient } from "@/lib/guest-client";

export interface AffiliateApplicationCreatePayload {
  full_name: string;
  email: string;
  phone?: string | null;
  promotion_channels: string;
  audience_description?: string | null;
  website_url?: string | null;
}

export interface AffiliateApplicationPublicResponse {
  public_id: string;
  status: string;
  submitted_at: string;
  message: string;
}

export interface AffiliateMeResponse {
  public_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  public_code: string;
  status: string;
  approved_at: string;
  activated_at?: string | null;
  last_login_at?: string | null;
}

export interface AffiliateSessionResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  affiliate: AffiliateMeResponse;
}

export interface AffiliateMessageResponse {
  message: string;
}

// 1. Public: Submit an Application
export async function submitAffiliateApplication(
  payload: AffiliateApplicationCreatePayload
): Promise<AffiliateApplicationPublicResponse> {
  const res = await guestClient.post<AffiliateApplicationPublicResponse>(
    "/api/v1/affiliates/applications",
    payload
  );
  return res.data;
}

// 2. Activate Account via 24-hr Token
export async function activateAffiliateAccount(
  token: string,
  new_password: string,
  captcha_token: string
): Promise<AffiliateMessageResponse> {
  const res = await guestClient.post<AffiliateMessageResponse>(
    "/api/v1/affiliates/auth/activate",
    { token, new_password, captcha_token }
  );
  return res.data;
}

// 3. Login Affiliate
export async function loginAffiliate(
  email: string,
  password: string,
  captcha_token: string
): Promise<AffiliateSessionResponse> {
  const res = await guestClient.post<AffiliateSessionResponse>(
    "/api/v1/affiliates/auth/login",
    { email, password, captcha_token }
  );
  setAffiliateAccessToken(res.data.access_token);
  return res.data;
}

// 4. Logout Affiliate
export async function logoutAffiliate(): Promise<AffiliateMessageResponse> {
  try {
    const res = await affiliateClient.post<AffiliateMessageResponse>(
      "/api/v1/affiliates/auth/logout"
    );
    return res.data;
  } finally {
    setAffiliateAccessToken(null);
  }
}

// 5. Get My Profile
export async function getAffiliateProfile(): Promise<AffiliateMeResponse> {
  const res = await affiliateClient.get<AffiliateMeResponse>(
    "/api/v1/affiliates/auth/me"
  );
  return res.data;
}