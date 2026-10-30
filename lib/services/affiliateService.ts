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
  status: "PENDING" | "APPROVED" | "PROCESSING" | "REJECTED" | "PAID" | "FAILED";
  payout_reference?: string | null;
  rejection_reason?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
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

export interface WithdrawalCreatePayload {
  amount: number;
  currency: string;
  idempotency_key: string;
}

/**
 * =========================================================
 * KYC INTERFACES (Manual, Cashfree & DigiLocker)
 * =========================================================
 */

export type KYCStatus =
  | "NOT_STARTED"
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "RESUBMISSION_REQUIRED"
  | "REJECTED"
  | "VERIFIED";

export type DocumentType = "AADHAAR_FRONT" | "AADHAAR_BACK" | "PAN_CARD";

export interface PANVerificationPayload {
  pan: string;
  name?: string | null;
}

export interface PANVerificationResponse {
  success: boolean;
  affiliate_id: string;
  document_type: string;
  masked_pan: string;
  verified: boolean;
  provider_status?: string | null;
  message: string;
}

export interface AadhaarOTPPayload {
  aadhaar_number: string;
}

export interface AadhaarOTPResponse {
  document_type: string;
  masked_aadhaar: string;
  otp_sent: boolean;
  reference_id: string;
  message: string;
}

export interface AadhaarVerifyPayload {
  reference_id: string;
  otp: string;
}

export interface AadhaarVerifyResponse {
  document_type: string;
  verified: boolean;
  provider_status?: string | null;
  reference_id: string;
  message: string;
}

export interface ManualKYCStatusResponse {
  status: KYCStatus;
  submission_id?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  decision_reason?: string | null;
}

export interface KYCDocumentMeta {
  public_id: string;
  document_type: DocumentType;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  sha256_checksum?: string;
  uploaded_at: string;
}

export interface ManualKYCDocumentsResponse {
  status: KYCStatus;
  submission_id?: string | null;
  documents: Array<{
    document_type: DocumentType;
    uploaded: boolean;
    original_filename: string;
    content_type: string;
    file_size_bytes: number;
    uploaded_at: string;
  }>;
}

export interface ManualKYCSubmissionResponse {
  public_id: string;
  affiliate_id: number;
  status: KYCStatus;
  assigned_reviewer_id?: number | null;
  submitted_at: string;
  reviewed_at?: string | null;
  decision_reason?: string | null;
  documents: KYCDocumentMeta[];
  review_history: any[];
}

export interface DigiLockerInitiatePayload {
  redirect_url: string;
  user_flow?: "signin" | "signup";
}

export interface DigiLockerInitiateResponse {
  verification_id: string;
  reference_id?: string;
  url: string;
  status: string;
  expires_in_seconds?: number;
}

export interface DigiLockerStatusResponse {
  verification_id: string;
  reference_id?: string;
  status:
    | "initiated"
    | "pending"
    | "AUTHENTICATED"
    | "COMPLETED"
    | "SUCCESS"
    | "FAILED"
    | "EXPIRED"
    | string;
  document_requested?: string[];
  document_status?: Record<string, string>;
  message?: string;
}

export interface DigiLockerDocumentResponse {
  verification_id: string;
  document_type: string;
  status: string;
  data?: Record<string, any>;
  message?: string;
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

// Commissions & Earnings
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

// Direct Provider KYC Operations
export async function verifyAffiliatePAN(
  payload: PANVerificationPayload
): Promise<PANVerificationResponse> {
  const res = await affiliateClient.post<PANVerificationResponse>(
    "/api/v1/affiliate/kyc/pan/verify",
    payload
  );
  return res.data;
}

export async function generateAffiliateAadhaarOTP(
  payload: AadhaarOTPPayload
): Promise<AadhaarOTPResponse> {
  const res = await affiliateClient.post<AadhaarOTPResponse>(
    "/api/v1/affiliate/kyc/aadhaar/otp",
    payload
  );
  return res.data;
}

export async function verifyAffiliateAadhaarOTP(
  payload: AadhaarVerifyPayload
): Promise<AadhaarVerifyResponse> {
  const res = await affiliateClient.post<AadhaarVerifyResponse>(
    "/api/v1/affiliate/kyc/aadhaar/verify",
    payload
  );
  return res.data;
}

// Manual Dossier KYC Operations
export async function getManualKYCStatus(): Promise<ManualKYCStatusResponse> {
  const res = await affiliateClient.get<ManualKYCStatusResponse>(
    "/api/v1/affiliate/kyc/manual/status"
  );
  return res.data;
}

export async function getManualKYCDocuments(): Promise<ManualKYCDocumentsResponse> {
  const res = await affiliateClient.get<ManualKYCDocumentsResponse>(
    "/api/v1/affiliate/kyc/manual/documents"
  );
  return res.data;
}

export async function submitManualKYC(
  aadhaarFrontFile: File,
  aadhaarBackFile: File,
  panCardFile: File
): Promise<ManualKYCSubmissionResponse> {
  const formData = new FormData();
  formData.append("aadhaar_front", aadhaarFrontFile);
  formData.append("aadhaar_back", aadhaarBackFile);
  formData.append("pan_card", panCardFile);

  const res = await affiliateClient.post<ManualKYCSubmissionResponse>(
    "/api/v1/affiliate/kyc/manual/submit",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

// DigiLocker Automated KYC Operations
export async function initiateDigiLockerKYC(
  payload: DigiLockerInitiatePayload
): Promise<DigiLockerInitiateResponse> {
  const res = await affiliateClient.post<DigiLockerInitiateResponse>(
    "/api/v1/affiliate/kyc/digilocker/initiate",
    payload
  );
  return res.data;
}

export async function getDigiLockerKYCStatus(
  verificationId: string
): Promise<DigiLockerStatusResponse> {
  const res = await affiliateClient.get<DigiLockerStatusResponse>(
    `/api/v1/affiliate/kyc/digilocker/status/${verificationId}`
  );
  return res.data;
}

export async function getDigiLockerKYCDocument(
  verificationId: string
): Promise<DigiLockerDocumentResponse> {
  const res = await affiliateClient.get<DigiLockerDocumentResponse>(
    `/api/v1/affiliate/kyc/digilocker/document/${verificationId}`
  );
  return res.data;
}