// lib/services/adminUserService.ts

import { apiClient } from "@/lib/api-client";
import { Role } from "./roleService";

export interface AdminUser {
  id?: number;
  public_id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superadmin: boolean;
  roles?: Role[];
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserPayload {
  email: string;
  full_name: string;
  password?: string;
  is_active?: boolean;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<AdminUser[]>("/api/v1/admin/users");
  return Array.isArray(response.data) ? response.data : [];
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>("/api/v1/admin/users", payload);
  return response.data;
}

export async function deleteAdminUser(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/admin/users/${publicId}`);
  return response.data;
}

export async function assignRoleToAdminUser(
  userPublicId: string, 
  rolePublicId: string
): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>(
    `/api/v1/admin/users/${userPublicId}/roles`,
    { role_public_id: rolePublicId }
  );
  return response.data;
}

export async function removeRoleFromAdminUser(
  userPublicId: string, 
  rolePublicId: string
): Promise<null> {
  const response = await apiClient.delete<null>(
    `/api/v1/admin/users/${userPublicId}/roles/${rolePublicId}`
  );
  return response.data;
}