// lib/services/adminAffiliateService.ts

import { apiClient } from "@/lib/api-client";

/**
 * =========================================================
 * SCHEMAS & INTERFACES
 * =========================================================
 */

export type AffiliateApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AffiliateStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";
export type LedgerEntryType = "COMMISSION" | "REVERSAL" | "ADJUSTMENT";

export interface AdminAffiliateApplication {
  id: number;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  promotion_channels: string;
  audience_description?: string | null;
  website_url?: string | null;
  status: AffiliateApplicationStatus;
  reviewed_by_admin_id?: number | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
}

export interface AdminAffiliateItem {
  id: number;
  public_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  public_code: string;
  status: AffiliateStatus;
  is_activated: boolean;
  can_earn: boolean;
  approved_at: string;
  activated_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

export interface AdminCommissionPolicy {
  id: number;
  affiliate_id?: number | null;
  rate_type: string;
  rate_value: string | number;
  valid_from: string;
  valid_until?: string | null;
  is_active: boolean;
  description?: string | null;
  created_at: string;
}

export interface AdminWithdrawalItem {
  id: number;
  public_id: string;
  affiliate_id: number;
  amount: string | number;
  currency: string;
  status: WithdrawalStatus;
  payout_reference?: string | null;
  rejection_reason?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface AdminCommissionLedgerItem {
  id: number;
  public_id: string;
  affiliate_id: number;
  attribution_id?: number | null;
  order_id?: number | null;
  entry_type: LedgerEntryType;
  amount: string | number;
  currency: string;
  base_amount?: string | number | null;
  commission_rate?: string | number | null;
  idempotency_key: string;
  reverses_entry_id?: number | null;
  description?: string | null;
  created_at: string;
}

export interface AdminCommissionAdjustmentPayload {
  affiliate_id: number;
  amount: number;
  currency?: string;
  entry_type: "ADJUSTMENT" | "REVERSAL";
  reason: string;
  idempotency_key?: string;
  order_id?: number;
}

/**
 * =========================================================
 * 1. APPLICATIONS DESK
 * =========================================================
 */

/**
 * GET /api/v1/admin/affiliates/applications
 * Lists candidate applications filtered by PENDING, APPROVED, or REJECTED.
 */
export async function getAdminApplications(
  status?: AffiliateApplicationStatus | string,
  limit = 50,
  offset = 0
): Promise<AdminAffiliateApplication[]> {
  const res = await apiClient.get<AdminAffiliateApplication[]>(
    "/api/v1/admin/affiliates/applications",
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

/**
 * POST /api/v1/admin/affiliates/applications/{public_id}/approve
 * Approves applicant, provisions unique public_code, and sends 24h activation link.
 */
export async function approveApplication(publicId: string): Promise<any> {
  const res = await apiClient.post(
    `/api/v1/admin/affiliates/applications/${publicId}/approve`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/affiliates/applications/{public_id}/reject
 * Rejects application with mandatory audit reason.
 */
export async function rejectApplication(
  publicId: string,
  reason: string
): Promise<any> {
  const res = await apiClient.post(
    `/api/v1/admin/affiliates/applications/${publicId}/reject`,
    { reason }
  );
  return res.data;
}

/**
 * =========================================================
 * 2. PARTNER DIRECTORY
 * =========================================================
 */

/**
 * GET /api/v1/admin/affiliates
 * Lists registered partners with optional search and status filtering.
 */
export async function getAdminAffiliates(
  status?: AffiliateStatus | string,
  search?: string,
  limit = 50,
  offset = 0
): Promise<AdminAffiliateItem[]> {
  const res = await apiClient.get<AdminAffiliateItem[]>(
    "/api/v1/admin/affiliates",
    {
      params: {
        status: status || undefined,
        search: search || undefined,
        limit,
        offset,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * GET /api/v1/admin/affiliates/{affiliate_id}
 * Retrieves profile and metrics for a single partner.
 */
export async function getAdminAffiliateById(
  affiliateId: number
): Promise<AdminAffiliateItem> {
  const res = await apiClient.get<AdminAffiliateItem>(
    `/api/v1/admin/affiliates/${affiliateId}`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/affiliates/{affiliate_id}/send-activation
 * Generates and emails a fresh 24-hour activation link.
 */
export async function resendActivationLink(
  affiliateId: number
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    `/api/v1/admin/affiliates/${affiliateId}/send-activation`
  );
  return res.data;
}

/**
 * PATCH /api/v1/admin/affiliates/{affiliate_id}/status
 * Updates partner status (ACTIVE, INACTIVE, SUSPENDED).
 */
export async function updateAffiliateStatus(
  affiliateId: number,
  status: AffiliateStatus
): Promise<AdminAffiliateItem> {
  const res = await apiClient.patch<AdminAffiliateItem>(
    `/api/v1/admin/affiliates/${affiliateId}/status`,
    { status }
  );
  return res.data;
}

/**
 * =========================================================
 * 3. COMMISSION POLICIES DESK
 * =========================================================
 */

/**
 * GET /api/v1/admin/affiliates/policies
 * Fetches all global default policies or affiliate overrides.
 */
export async function getCommissionPolicies(
  affiliateId?: number,
  activeOnly = true
): Promise<AdminCommissionPolicy[]> {
  const res = await apiClient.get<AdminCommissionPolicy[]>(
    "/api/v1/admin/affiliates/policies",
    {
      params: {
        affiliate_id: affiliateId,
        active_only: activeOnly,
      },
    }
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * POST /api/v1/admin/affiliates/policies
 * Creates a global default rate or custom partner commission override.
 */
export async function createCommissionPolicy(payload: {
  rate_value: number;
  affiliate_id?: number | null;
  description?: string;
  valid_from?: string;
  valid_until?: string | null;
}): Promise<AdminCommissionPolicy> {
  const res = await apiClient.post<AdminCommissionPolicy>(
    "/api/v1/admin/affiliates/policies",
    payload
  );
  return res.data;
}

/**
 * POST /api/v1/admin/affiliates/policies/{policy_id}/deactivate
 * Immediately deactivates an existing commission policy.
 */
export async function deactivateCommissionPolicy(
  policyId: number
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    `/api/v1/admin/affiliates/policies/${policyId}/deactivate`
  );
  return res.data;
}

/**
 * =========================================================
 * 4. PAYOUT SETTLEMENTS DESK
 * =========================================================
 */

/**
 * GET /api/v1/admin/affiliates/withdrawals
 * Master queue of payout requests across all partners.
 */
export async function getAdminWithdrawals(
  status?: WithdrawalStatus | string,
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

/**
 * POST /api/v1/admin/affiliates/withdrawals/{public_id}/approve
 * Approves a pending withdrawal request for bank processing.
 */
export async function approveWithdrawal(
  publicId: string
): Promise<AdminWithdrawalItem> {
  const res = await apiClient.post<AdminWithdrawalItem>(
    `/api/v1/admin/affiliates/withdrawals/${publicId}/approve`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/affiliates/withdrawals/{public_id}/reject
 * Rejects withdrawal request and automatically unlocks reserved funds back to partner.
 */
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

/**
 * POST /api/v1/admin/affiliates/withdrawals/{public_id}/mark-paid
 * Finalizes payout by logging the bank UTR or UPI transaction reference number.
 */
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

/**
 * =========================================================
 * 5. LEDGER AUDIT & ADJUSTMENTS DESK
 * =========================================================
 */

/**
 * GET /api/v1/admin/affiliates/ledger
 * Queries the double-entry commission ledger for auditing.
 */
export async function getAdminCommissionLedger(params?: {
  affiliate_id?: number;
  entry_type?: LedgerEntryType;
  order_id?: number;
  limit?: number;
  offset?: number;
}): Promise<AdminCommissionLedgerItem[]> {
  const res = await apiClient.get<AdminCommissionLedgerItem[]>(
    "/api/v1/admin/affiliates/ledger",
    { params }
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * POST /api/v1/admin/affiliates/adjustments
 * Records an auditable manual balance adjustment or reversal with idempotency.
 */
export async function createAdminCommissionAdjustment(
  payload: AdminCommissionAdjustmentPayload
): Promise<AdminCommissionLedgerItem> {
  const idempotencyKey =
    payload.idempotency_key ||
    `adj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const res = await apiClient.post<AdminCommissionLedgerItem>(
    "/api/v1/admin/affiliates/adjustments",
    {
      ...payload,
      idempotency_key: idempotencyKey,
      currency: payload.currency || "INR",
    }
  );
  return res.data;
}