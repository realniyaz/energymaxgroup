// lib/services/adminAffiliateService.ts
import { apiClient } from "@/lib/api-client";

export interface AdminAffiliateApplication {
  id?: number;
  public_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  promotion_channels: string;
  audience_description: string | null;
  website_url: string | null;
  status: "pending" | "approved" | "rejected";
  decision_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_admin_id: number | null;
}

export interface AdminAffiliateItem {
  id?: number;
  public_id: string;
  customer_id: number | null;
  application_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  public_code: string;
  status: "active" | "suspended" | "closed";
  approved_by_admin_id: number | null;
  approved_at: string;
  created_at: string;
  updated_at: string;
  password_hash?: string | null;
  activated_at?: string | null;
  last_login_at?: string | null;
}

/**
 * 1. GET /api/v1/admin/affiliate-applications
 */
export async function getAdminAffiliateApplications(params?: {
  status_filter?: "pending" | "approved" | "rejected";
  limit?: number;
  offset?: number;
}): Promise<AdminAffiliateApplication[]> {
  const res = await apiClient.get<AdminAffiliateApplication[]>(
    "/api/v1/admin/affiliate-applications",
    { params }
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * 2. POST /api/v1/admin/affiliate-applications/{public_id}/approve
 */
export async function approveAffiliateApplication(
  publicId: string
): Promise<AdminAffiliateItem> {
  const res = await apiClient.post<AdminAffiliateItem>(
    `/api/v1/admin/affiliate-applications/${publicId}/approve`
  );
  return res.data;
}

/**
 * 3. POST /api/v1/admin/affiliate-applications/{public_id}/reject
 */
export async function rejectAffiliateApplication(
  publicId: string,
  reason?: string
): Promise<AdminAffiliateApplication> {
  const res = await apiClient.post<AdminAffiliateApplication>(
    `/api/v1/admin/affiliate-applications/${publicId}/reject`,
    { decision_reason: reason || null }
  );
  return res.data;
}

/**
 * 4. GET /api/v1/admin/affiliates
 */
export async function getAdminAffiliates(params?: {
  status_filter?: "active" | "suspended" | "closed";
  limit?: number;
  offset?: number;
}): Promise<AdminAffiliateItem[]> {
  const res = await apiClient.get<AdminAffiliateItem[]>(
    "/api/v1/admin/affiliates",
    { params }
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * 5. POST /api/v1/admin/affiliates/{public_id}/send-activation
 */
export async function sendAffiliateActivation(
  publicId: string
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    `/api/v1/admin/affiliates/${publicId}/send-activation`
  );
  return res.data;
}