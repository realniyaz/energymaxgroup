// lib/services/adminAffiliateService.ts
import { apiClient } from "@/lib/api-client";

/**
 * =========================================================
 * SCHEMAS & INTERFACES (Aligned with Backend Pydantic Schemas)
 * =========================================================
 */

export type AffiliateApplicationStatus = "pending" | "approved" | "rejected";
export type AffiliateStatus = "active" | "inactive" | "suspended";

export interface AdminAffiliateApplication {
  public_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  promotion_channels: string;
  audience_description?: string | null;
  website_url?: string | null;
  status: string;
  decision_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by_admin_id?: number | null;
}

export interface AdminAffiliateItem {
  public_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  public_code: string;
  status: string;
  approved_at: string;
  created_at: string;
}

export interface CommissionPolicyCreatePayload {
  affiliate_public_id?: string | null;
  commission_rate: number;
  effective_from: string; // ISO 8601 with timezone (e.g. 2026-10-27T00:00:00Z)
  effective_until?: string | null;
}

export interface AdminCommissionPolicy {
  public_id: string;
  affiliate_id?: number | null;
  commission_rate: number | string;
  is_active: boolean;
  effective_from: string;
  effective_until?: string | null;
  created_by_admin_id: number;
  created_at: string;
  updated_at: string;
}

export interface CommissionLedgerItem {
  public_id: string;
  affiliate_id: number;
  attribution_id: number;
  order_id: number;
  entry_type: "COMMISSION" | "REVERSAL" | "ADJUSTMENT";
  amount: number | string;
  currency: string;
  base_amount: number | string;
  commission_rate: number | string;
  idempotency_key: string;
  reverses_entry_id?: number | null;
  description?: string | null;
  created_at: string;
}

export interface AdminWithdrawalItem {
  public_id: string;
  affiliate_id: number;
  amount: number | string;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  payout_reference?: string | null;
  rejection_reason?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by_admin_id?: number | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * =========================================================
 * 1. APPLICATIONS DESK (/api/v1/admin/affiliate-applications)
 * =========================================================
 */

export async function getAdminApplications(
  status?: string | null,
  limit = 100,
  offset = 0
): Promise<AdminAffiliateApplication[]> {
  const clean = status ? status.toLowerCase().trim() : undefined;
  const statusParam = clean && clean !== "all" ? clean : undefined;

  const res = await apiClient.get<AdminAffiliateApplication[]>(
    "/api/v1/admin/affiliate-applications",
    {
      params: {
        status: statusParam,
        limit,
        offset,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function approveApplication(publicId: string): Promise<AdminAffiliateItem> {
  const res = await apiClient.post<AdminAffiliateItem>(
    `/api/v1/admin/affiliate-applications/${publicId}/approve`
  );
  return res.data;
}

export async function rejectApplication(
  publicId: string,
  decisionReason: string
): Promise<AdminAffiliateApplication> {
  const res = await apiClient.post<AdminAffiliateApplication>(
    `/api/v1/admin/affiliate-applications/${publicId}/reject`,
    { decision_reason: decisionReason }
  );
  return res.data;
}

/**
 * =========================================================
 * 2. PARTNER DIRECTORY (/api/v1/admin/affiliates)
 * =========================================================
 */

export async function getAdminAffiliates(
  status?: string | null,
  limit = 100,
  offset = 0
): Promise<AdminAffiliateItem[]> {
  const clean = status ? status.toLowerCase().trim() : undefined;
  const statusParam = clean && clean !== "all" ? clean : undefined;

  const res = await apiClient.get<AdminAffiliateItem[]>(
    "/api/v1/admin/affiliates",
    {
      params: {
        status: statusParam,
        limit,
        offset,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function resendActivationLink(
  affiliatePublicId: string
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    `/api/v1/admin/affiliates/${affiliatePublicId}/send-activation`
  );
  return res.data;
}

/**
 * =========================================================
 * 3. COMMISSION POLICIES (/api/v1/admin/affiliates/commission-policies)
 * =========================================================
 */

export async function getCommissionPolicies(
  affiliatePublicId?: string | null,
  activeOnly = false,
  limit = 100,
  offset = 0
): Promise<AdminCommissionPolicy[]> {
  const res = await apiClient.get<AdminCommissionPolicy[]>(
    "/api/v1/admin/affiliates/commission-policies",
    {
      params: {
        affiliate_public_id: affiliatePublicId || undefined,
        active_only: activeOnly,
        limit,
        offset,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function createCommissionPolicy(
  payload: CommissionPolicyCreatePayload
): Promise<AdminCommissionPolicy> {
  const res = await apiClient.post<AdminCommissionPolicy>(
    "/api/v1/admin/affiliates/commission-policies",
    {
      ...payload,
      affiliate_public_id: payload.affiliate_public_id || null,
    }
  );
  return res.data;
}

export async function deactivateCommissionPolicy(
  publicId: string
): Promise<AdminCommissionPolicy> {
  const res = await apiClient.post<AdminCommissionPolicy>(
    `/api/v1/admin/affiliates/commission-policies/${publicId}/deactivate`
  );
  return res.data;
}

/**
 * =========================================================
 * 4. COMMISSIONS LEDGER & MUTATIONS (/api/v1/admin/affiliates/commissions)
 * =========================================================
 */

export async function getAdminCommissions(
  affiliatePublicId?: string,
  entryType?: string,
  limit = 50,
  offset = 0
): Promise<CommissionLedgerItem[]> {
  const res = await apiClient.get<CommissionLedgerItem[]>(
    "/api/v1/admin/affiliates/commissions",
    {
      params: {
        affiliate_public_id: affiliatePublicId || undefined,
        entry_type: entryType || undefined,
        limit,
        offset,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function adjustCommission(
  publicId: string,
  payload: {
    amount: number;
    currency: string;
    description: string;
    idempotency_key: string;
  }
): Promise<CommissionLedgerItem> {
  const res = await apiClient.post<CommissionLedgerItem>(
    `/api/v1/admin/affiliates/commissions/${publicId}/adjust`,
    payload
  );
  return res.data;
}

export async function reverseCommission(
  publicId: string,
  payload: {
    reason: string;
    idempotency_key: string;
  }
): Promise<CommissionLedgerItem> {
  const res = await apiClient.post<CommissionLedgerItem>(
    `/api/v1/admin/affiliates/commissions/${publicId}/reverse`,
    payload
  );
  return res.data;
}

/**
 * =========================================================
 * 5. PAYOUT SETTLEMENTS (/api/v1/admin/affiliates/withdrawals)
 * =========================================================
 */

export async function getAdminWithdrawals(
  status?: string,
  limit = 50,
  offset = 0
): Promise<AdminWithdrawalItem[]> {
  const res = await apiClient.get<AdminWithdrawalItem[]>(
    "/api/v1/admin/affiliates/withdrawals",
    {
      params: {
        status: status || undefined,
        limit,
        offset,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function approveWithdrawal(publicId: string): Promise<AdminWithdrawalItem> {
  const res = await apiClient.post<AdminWithdrawalItem>(
    `/api/v1/admin/affiliates/withdrawals/${publicId}/approve`
  );
  return res.data;
}

export async function rejectWithdrawal(
  publicId: string,
  reason: string
): Promise<AdminWithdrawalItem> {
  const res = await apiClient.post<AdminWithdrawalItem>(
    `/api/v1/admin/affiliates/withdrawals/${publicId}/reject`,
    { reason }
  );
  return res.data;
}

export async function markWithdrawalPaid(
  publicId: string,
  payoutReference: string
): Promise<AdminWithdrawalItem> {
  const res = await apiClient.post<AdminWithdrawalItem>(
    `/api/v1/admin/affiliates/withdrawals/${publicId}/mark-paid`,
    { payout_reference: payoutReference }
  );
  return res.data;
}