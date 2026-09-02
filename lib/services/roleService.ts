// lib/services/roleService.ts

import { apiClient } from "@/lib/api-client";

export interface RolePayload {
  name: string;
  description: string;
}

export interface Role {
  id?: number;
  public_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PermissionPayload {
  name: string;
  description: string;
}

export interface Permission {
  id?: number;
  public_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermissionAssignment {
  permission_public_id: string;
  permission_name?: string;
}

/**
 * =========================================================
 * ROLE ENDPOINTS
 * =========================================================
 */

export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<Role[]>("/api/v1/admin/roles");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getRoleByPublicId(publicId: string): Promise<Role> {
  const response = await apiClient.get<Role>(`/api/v1/admin/roles/${publicId}`);
  return response.data;
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const response = await apiClient.post<Role>("/api/v1/admin/roles", payload);
  return response.data;
}

export async function updateRole(publicId: string, payload: RoleUpdatePayload): Promise<Role> {
  const response = await apiClient.patch<Role>(`/api/v1/admin/roles/${publicId}`, payload);
  return response.data;
}

export async function deleteRole(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/admin/roles/${publicId}`);
  return response.data;
}

/**
 * =========================================================
 * PERMISSION ENDPOINTS
 * =========================================================
 */

export async function getPermissions(): Promise<Permission[]> {
  const response = await apiClient.get<Permission[]>("/api/v1/admin/permissions");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getPermissionByPublicId(publicId: string): Promise<Permission> {
  const response = await apiClient.get<Permission>(`/api/v1/admin/permissions/${publicId}`);
  return response.data;
}

export async function createPermission(payload: PermissionPayload): Promise<Permission> {
  const response = await apiClient.post<Permission>("/api/v1/admin/permissions", payload);
  return response.data;
}

export async function updatePermission(publicId: string, payload: Partial<PermissionPayload>): Promise<Permission> {
  const response = await apiClient.patch<Permission>(`/api/v1/admin/permissions/${publicId}`, payload);
  return response.data;
}

export async function deletePermission(publicId: string): Promise<null> {
  const response = await apiClient.delete<null>(`/api/v1/admin/permissions/${publicId}`);
  return response.data;
}

/**
 * =========================================================
 * ROLE-PERMISSION ASSIGNMENT ENDPOINTS
 * =========================================================
 */

export async function getRolePermissions(roleId: number | string): Promise<RolePermissionAssignment[]> {
  const response = await apiClient.get<RolePermissionAssignment[]>(`/api/v1/admin/roles/${roleId}/permissions`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function assignPermissionToRole(
  roleId: number | string, 
  permissionPublicId: string
): Promise<RolePermissionAssignment> {
  const response = await apiClient.post<RolePermissionAssignment>(
    `/api/v1/admin/roles/${roleId}/permissions`,
    { permission_public_id: permissionPublicId }
  );
  return response.data;
}

export async function removePermissionFromRole(
  roleId: number | string, 
  permissionPublicId: string
): Promise<null> {
  const response = await apiClient.delete<null>(
    `/api/v1/admin/roles/${roleId}/permissions/${permissionPublicId}`
  );
  return response.data;
}