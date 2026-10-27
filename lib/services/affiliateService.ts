// lib/services/affiliateService.ts
import { affiliateClient } from "@/lib/affiliate-client";

/**
 * =========================================================
 * SCHEMAS & INTERFACES
 * =========================================================
 */

export interface AffiliateApplicationCreate {
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
  message?: string;
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

export interface CurrencyEarnings {
  currency: string;
  total_commissions: string | number;
  total_reversals: string | number;
  total_adjustments: string | number;
  net_earnings: string | number;
  commission_count: number;
}

export interface DashboardResponse {
  affiliate: {
    id: string;
    public_code: string;
    status: string;
    is_activated: boolean;
    can_earn: boolean;
  };
  performance: {
    total_clicks: number;
    total_attributed_orders: number;
    click_to_order_rate_percent: number;
  };
  commissions: {
    available: boolean;
    earnings_by_currency: CurrencyEarnings[];
  };
}

export interface PerformanceDayItem {
  date: string;
  clicks: number;
  attributed_orders: number;
  click_to_order_rate_percent: number;
}

export interface AffiliatePerformanceResponse {
  period: {
    start_date: string;
    end_date: string;
    timezone: string;
  };
  summary: {
    total_clicks: number;
    total_attributed_orders: number;
    click_to_order_rate_percent: number;
  };
  daily: PerformanceDayItem[];
}

export interface WalletBalanceItem {
  currency: string;
  net_earnings: string | number;
  reserved_balance: string | number;
  paid_balance: string | number;
  available_balance: string | number;
}

export interface CommissionLedgerItem {
  public_id: string;
  affiliate_id: number;
  attribution_id: number;
  order_id: number;
  order_number?: string | null;
  order_public_id?: string | null;
  entry_type: "COMMISSION" | "REVERSAL" | "ADJUSTMENT";
  amount: string | number;
  currency: string;
  base_amount: string | number;
  commission_rate: string | number;
  idempotency_key: string;
  reverses_entry_id?: number | null;
  description?: string | null;
  created_at: string;
}

export interface WithdrawalItem {
  public_id: string;
  affiliate_id: number;
  amount: string | number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  payout_reference?: string | null;
  rejection_reason?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalCreatePayload {
  amount: number;
  currency: string;
  idempotency_key: string;
}

/**
 * =========================================================
 * API SERVICE METHODS
 * =========================================================
 */

// Public Onboarding
export async function submitAffiliateApplication(
  data: AffiliateApplicationCreate
): Promise<AffiliateApplicationPublicResponse> {
  const res = await affiliateClient.post<AffiliateApplicationPublicResponse>(
    "/api/v1/affiliates/applications",
    data
  );
  return res.data;
}

// Authentication & Activation
export async function activateAffiliateAccount(
  token: string,
  new_password: string,
  captcha_token: string
): Promise<AffiliateMessageResponse> {
  const res = await affiliateClient.post<AffiliateMessageResponse>(
    "/api/v1/affiliates/auth/activate",
    {
      token,
      new_password,
      captcha_token,
    }
  );
  return res.data;
}

export async function loginAffiliate(
  email: string,
  pass: string,
  captcha_token: string
): Promise<AffiliateSessionResponse> {
  const res = await affiliateClient.post<AffiliateSessionResponse>(
    "/api/v1/affiliates/auth/login",
    {
      email,
      password: pass,
      captcha_token,
    }
  );
  return res.data;
}

export async function logoutAffiliate(): Promise<AffiliateMessageResponse> {
  const res = await affiliateClient.post<AffiliateMessageResponse>(
    "/api/v1/affiliates/auth/logout"
  );
  return res.data;
}

export async function getAffiliateProfile(): Promise<AffiliateMeResponse> {
  const res = await affiliateClient.get<AffiliateMeResponse>(
    "/api/v1/affiliates/auth/me"
  );
  return res.data;
}

// Dashboard & Analytics
export async function getAffiliateDashboard(): Promise<DashboardResponse> {
  const res = await affiliateClient.get<DashboardResponse>(
    "/api/v1/affiliates/dashboard"
  );
  return res.data;
}

export async function getAffiliatePerformance(
  startDate: string,
  endDate: string
): Promise<AffiliatePerformanceResponse> {
  const res = await affiliateClient.get<AffiliatePerformanceResponse>(
    "/api/v1/affiliates/performance",
    {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    }
  );
  return res.data;
}

// Commissions & Earnings (Supports entry_type and order-level filter)
export async function getAffiliateCommissions(
  limit = 50,
  offset = 0,
  entryType?: string,
  orderPublicId?: string,
  orderNumber?: string
): Promise<CommissionLedgerItem[]> {
  const res = await affiliateClient.get<CommissionLedgerItem[]>(
    "/api/v1/affiliate/commissions",
    {
      params: {
        limit,
        offset,
        entry_type: entryType || undefined,
        order_public_id: orderPublicId || undefined,
        order_number: orderNumber || undefined,
      },
    }
  );
  return res.data;
}

export async function getAffiliateEarnings(): Promise<CurrencyEarnings[]> {
  const res = await affiliateClient.get<CurrencyEarnings[]>(
    "/api/v1/affiliate/earnings"
  );
  return res.data;
}

// Wallet & Withdrawals
export async function getAffiliateWallet(): Promise<WalletBalanceItem[]> {
  try {
    const res = await affiliateClient.get<WalletBalanceItem[]>(
      "/api/v1/affiliate/withdrawals/wallet"
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    try {
      const fallbackRes = await affiliateClient.get<WalletBalanceItem[]>(
        "/api/v1/affiliate/wallet"
      );
      return Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
    } catch {
      return [];
    }
  }
}

export async function getAffiliateWithdrawals(
  limit = 50,
  offset = 0
): Promise<WithdrawalItem[]> {
  const res = await affiliateClient.get<WithdrawalItem[]>(
    "/api/v1/affiliate/withdrawals",
    {
      params: { limit, offset },
    }
  );
  return res.data;
}

export async function requestAffiliateWithdrawal(
  payload: WithdrawalCreatePayload
): Promise<WithdrawalItem> {
  const res = await affiliateClient.post<WithdrawalItem>(
    "/api/v1/affiliate/withdrawals",
    payload
  );
  return res.data;
}