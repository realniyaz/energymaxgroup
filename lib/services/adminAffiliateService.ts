// lib/services/adminAffiliateService.ts
import { apiClient } from "@/lib/api-client";

/**
 * =========================================================
 * SCHEMAS & INTERFACES (Aligned with Backend Models & Schemas)
 * =========================================================
 */

export type AffiliateApplicationStatus = "pending" | "approved" | "rejected";
export type AffiliateStatus = "active" | "inactive" | "suspended";
export type WithdrawalStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "REJECTED"
  | "PAID"
  | "FAILED";
export type LedgerEntryType = "COMMISSION" | "REVERSAL" | "ADJUSTMENT";

export type AdminKYCStatus =
  | "NOT_STARTED"
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "RESUBMISSION_REQUIRED"
  | "REJECTED"
  | "VERIFIED";

export type AdminReviewDecision =
  | "APPROVED"
  | "REJECTED"
  | "RESUBMISSION_REQUESTED";

export interface AdminAffiliateProfileResponse {
  id: string; // public_id
  full_name: string;
  email: string;
  phone?: string | null;
  affiliate_code: string;
  account_status: string;
  registered_at: string;
}

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
  id?: number;
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
  effective_from: string; // ISO 8601 UTC
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
  order_number?: string | null;
  order_public_id?: string | null;
  entry_type: LedgerEntryType;
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
  status: WithdrawalStatus;
  payout_reference?: string | null;
  rejection_reason?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by_admin_id?: number | null;
  paid_at?: string | null;
  provider?: string | null;
  provider_reference?: string | null;
  beneficiary_reference?: string | null;
  payment_initiated_at?: string | null;
  failure_reason?: string | null;
  last_provider_status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalStartProcessingPayload {
  provider: string;
  beneficiary_reference: string;
}

export interface AdminKYCDocumentItem {
  public_id: string;
  document_type: "AADHAAR_FRONT" | "AADHAAR_BACK" | "PAN_CARD";
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  sha256_checksum: string;
  uploaded_at: string;
}

export interface AdminKYCHistoryItem {
  public_id: string;
  reviewer_id?: number | null;
  previous_status?: string | null;
  new_status: string;
  action: string;
  reason?: string | null;
  created_at: string;
}

export interface AdminKYCSubmissionItem {
  id?: number;
  public_id: string;
  affiliate_id: number;
  affiliate?: AdminAffiliateProfileResponse | null;
  status: AdminKYCStatus;
  assigned_reviewer_id?: number | null;
  submitted_at: string;
  reviewed_at?: string | null;
  decision_reason?: string | null;
  documents: AdminKYCDocumentItem[];
  review_history: AdminKYCHistoryItem[];
}

export interface AdminKYCQueueSummary {
  total_submissions: number;
  pending_review: number;
  in_review: number;
  resubmission_required: number;
  rejected: number;
  verified: number;
}

export interface AdminKYCDecisionPayload {
  decision: AdminReviewDecision;
  reason?: string | null;
}

export interface AdminKYCReassignPayload {
  reviewer_id: number;
  reason: string;
}

export interface AdminKYCReassignResponse {
  submission_id: string;
  status: string;
  previous_reviewer_id?: number | null;
  assigned_reviewer_id: number;
  reason: string;
}

export interface AdminKYCHistoryListResponse {
  submission_id: string;
  current_status: string;
  total_events: number;
  history: AdminKYCHistoryItem[];
}

/**
 * =========================================================
 * 1. APPLICATIONS DESK
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
 * 2. PARTNER DIRECTORY
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
 * 3. COMMISSION POLICIES
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
 * 4. COMMISSIONS LEDGER
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

export async function getAdminCommissionById(
  publicId: string
): Promise<CommissionLedgerItem> {
  const res = await apiClient.get<CommissionLedgerItem>(
    `/api/v1/admin/affiliates/commissions/${publicId}`
  );
  return res.data;
}

export async function adjustCommission(
  publicId: string,
  payload: {
    amount: number;
    currency: string;
    description: string;
    idempotency_key?: string;
  }
): Promise<CommissionLedgerItem> {
  const idempotencyKey =
    payload.idempotency_key ||
    `adj_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const res = await apiClient.post<CommissionLedgerItem>(
    `/api/v1/admin/affiliates/commissions/${publicId}/adjust`,
    {
      ...payload,
      idempotency_key: idempotencyKey,
    }
  );
  return res.data;
}

export async function reverseCommission(
  publicId: string,
  payload: {
    reason: string;
    idempotency_key?: string;
  }
): Promise<CommissionLedgerItem> {
  const idempotencyKey =
    payload.idempotency_key ||
    `rev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const res = await apiClient.post<CommissionLedgerItem>(
    `/api/v1/admin/affiliates/commissions/${publicId}/reverse`,
    {
      ...payload,
      idempotency_key: idempotencyKey,
    }
  );
  return res.data;
}

/**
 * =========================================================
 * 5. PAYOUT SETTLEMENTS
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

export async function getAdminWithdrawalById(
  publicId: string
): Promise<AdminWithdrawalItem> {
  const res = await apiClient.get<AdminWithdrawalItem>(
    `/api/v1/admin/affiliates/withdrawals/${publicId}`
  );
  return res.data;
}

export async function approveWithdrawal(
  publicId: string
): Promise<AdminWithdrawalItem> {
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

export async function startWithdrawalProcessing(
  publicId: string,
  payload: WithdrawalStartProcessingPayload
): Promise<AdminWithdrawalItem> {
  const res = await apiClient.post<AdminWithdrawalItem>(
    `/api/v1/admin/affiliates/withdrawals/${publicId}/start-processing`,
    payload
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

/**
 * =========================================================
 * 6. ADMIN AFFILIATE KYC DESK
 * =========================================================
 */

export async function getAdminKYCQueueSummary(): Promise<AdminKYCQueueSummary> {
  const res = await apiClient.get<AdminKYCQueueSummary>(
    "/api/v1/admin/affiliate-kyc/queue/summary"
  );
  return res.data;
}

export async function getAdminKYCSubmissions(
  statusFilter?: AdminKYCStatus | null,
  limit = 50,
  offset = 0
): Promise<{ items: AdminKYCSubmissionItem[]; limit: number; offset: number }> {
  const res = await apiClient.get<{
    items: AdminKYCSubmissionItem[];
    limit: number;
    offset: number;
  }>("/api/v1/admin/affiliate-kyc", {
    params: {
      status: statusFilter || undefined,
      limit,
      offset,
    },
  });
  return res.data;
}

export async function getAdminKYCSubmission(
  submissionId: number | string
): Promise<AdminKYCSubmissionItem> {
  const res = await apiClient.get<AdminKYCSubmissionItem>(
    `/api/v1/admin/affiliate-kyc/${submissionId}`
  );
  return res.data;
}

export async function claimAdminKYCSubmission(
  submissionId: number | string
): Promise<AdminKYCSubmissionItem> {
  const res = await apiClient.post<AdminKYCSubmissionItem>(
    `/api/v1/admin/affiliate-kyc/${submissionId}/claim`
  );
  return res.data;
}

export async function decideAdminKYCSubmission(
  submissionId: number | string,
  payload: AdminKYCDecisionPayload
): Promise<AdminKYCSubmissionItem> {
  const res = await apiClient.post<AdminKYCSubmissionItem>(
    `/api/v1/admin/affiliate-kyc/${submissionId}/decision`,
    payload
  );
  return res.data;
}

export async function downloadAdminKYCDocument(
  submissionId: number | string,
  documentType: "AADHAAR_FRONT" | "AADHAAR_BACK" | "PAN_CARD"
): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/v1/admin/affiliate-kyc/${submissionId}/documents/${documentType}`,
    {
      responseType: "blob",
    }
  );
  return res.data;
}

export async function reassignAdminKYCSubmission(
  submissionId: number | string,
  payload: AdminKYCReassignPayload
): Promise<AdminKYCReassignResponse> {
  const res = await apiClient.post<AdminKYCReassignResponse>(
    `/api/v1/admin/affiliate-kyc/${submissionId}/reassign`,
    payload
  );
  return res.data;
}

export async function getAdminKYCReviewHistory(
  submissionId: number | string
): Promise<AdminKYCHistoryListResponse> {
  const res = await apiClient.get<AdminKYCHistoryListResponse>(
    `/api/v1/admin/affiliate-kyc/${submissionId}/history`
  );
  return res.data;
}