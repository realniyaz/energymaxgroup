// lib/services/staffService.ts

import { apiClient } from "@/lib/api-client";

/**
 * =================================================================
 * SCHEMAS & INTERFACES
 * =================================================================
 */

export interface StaffUser {
  public_id: string;
  username: string;
  staff_type: string;
  is_super_admin: boolean;
  is_active: boolean;
  role_id: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffPayload {
  username: string;
  password: string;
  staff_type: string;
  role_id?: number;
  is_active?: boolean;
}

export interface UpdateStaffPayload {
  username?: string;
  staff_type?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface ChangeStaffPasswordPayload {
  password: string;
}

/**
 * =================================================================
 * ADMIN STAFF ENDPOINTS (Powered by apiClient)
 * =================================================================
 */

/**
 * GET /api/v1/admin/users
 * Retrieve the full roster of staff administrators.
 */
export async function listStaff(): Promise<StaffUser[]> {
  const res = await apiClient.get<StaffUser[] | { items: StaffUser[] }>("/api/v1/admin/users");
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return (res.data as any).items || [];
}

/**
 * GET /api/v1/admin/users/{public_id}
 * Retrieve an individual staff record by UUID.
 */
export async function getStaffByPublicId(publicId: string): Promise<StaffUser> {
  if (!publicId) throw new Error("Public ID is required");
  const res = await apiClient.get<StaffUser>(`/api/v1/admin/users/${publicId}`);
  return res.data;
}

/**
 * POST /api/v1/admin/users
 * Register a new staff user.
 */
export async function createStaff(payload: CreateStaffPayload): Promise<StaffUser> {
  const res = await apiClient.post<StaffUser>("/api/v1/admin/users", {
    ...payload,
    is_active: payload.is_active ?? true,
  });
  return res.data;
}

/**
 * PATCH /api/v1/admin/users/{public_id}
 * Update staff profile parameters (username, staff_type, role_id, is_active).
 */
export async function updateStaff(
  publicId: string,
  payload: UpdateStaffPayload
): Promise<StaffUser> {
  if (!publicId) throw new Error("Public ID is required");
  const res = await apiClient.patch<StaffUser>(`/api/v1/admin/users/${publicId}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/admin/users/{public_id}
 * Delete a staff user account.
 */
export async function deleteStaff(publicId: string): Promise<null> {
  if (!publicId) throw new Error("Public ID is required");
  await apiClient.delete(`/api/v1/admin/users/${publicId}`);
  return null;
}

/**
 * PATCH /api/v1/admin/users/{public_id}/password
 * Change password for a specific staff member.
 */
export async function changeStaffPassword(
  publicId: string,
  payload: ChangeStaffPasswordPayload
): Promise<StaffUser | null> {
  if (!publicId) throw new Error("Public ID is required");
  const res = await apiClient.patch<StaffUser>(`/api/v1/admin/users/${publicId}/password`, payload);
  return res.data;
}

/**
 * PATCH /api/v1/admin/users/{public_id}/status?is_active={boolean}
 * Toggle active/inactive status matching the FastAPI OpenAPI spec.
 */
export async function updateStaffStatus(
  publicId: string,
  isActive: boolean
): Promise<StaffUser> {
  if (!publicId) throw new Error("Public ID is required");
  const res = await apiClient.patch<StaffUser>(
    `/api/v1/admin/users/${publicId}/status?is_active=${Boolean(isActive)}`
  );
  return res.data;
}