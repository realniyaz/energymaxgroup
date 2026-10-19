// lib/services/adminWarehouseService.ts
import { apiClient } from "@/lib/api-client";

export const SHIPROCKET_DEFAULT_PICKUP_LOCATION = "warehouse";

export interface WarehouseItem {
  id?: number;
  public_id: string;
  name: string;
  code: string;
  address: string | null;
  is_active: boolean;
  is_default_pickup?: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseListResponse {
  items: WarehouseItem[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface GetWarehousesParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}

export interface WarehouseCreatePayload {
  name: string;
  code: string;
  address?: string | null;
  is_active?: boolean;
}

export interface WarehouseUpdatePayload {
  name?: string | null;
  code?: string | null;
  address?: string | null;
  is_active?: boolean | null;
}

/**
 * GET /api/v1/admin/inventory/warehouses
 * Retrieves all registered warehouses with pagination and fallback handling.
 */
export async function getAdminWarehouses(
  params?: GetWarehousesParams
): Promise<WarehouseListResponse> {
  const res = await apiClient.get<any>(
    "/api/v1/admin/inventory/warehouses",
    { params }
  );
  const data = res.data;

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: params?.page ?? 1,
      page_size: params?.limit ?? data.length,
    };
  }

  return {
    items: data.items || [],
    total: data.total ?? (data.items ? data.items.length : 0),
    page: data.page ?? (params?.page || 1),
    page_size: data.page_size ?? (params?.limit || 20),
  };
}

/**
 * GET /api/v1/admin/inventory/warehouses/{public_id}
 * Retrieves details for a specific warehouse by its UUID.
 */
export async function getAdminWarehouse(
  publicId: string
): Promise<WarehouseItem> {
  if (!publicId) throw new Error("Warehouse public ID is required.");
  const res = await apiClient.get<WarehouseItem>(
    `/api/v1/admin/inventory/warehouses/${publicId}`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/inventory/warehouses
 * Registers a new warehouse facility.
 */
export async function createAdminWarehouse(
  payload: WarehouseCreatePayload
): Promise<WarehouseItem> {
  const cleanPayload = {
    ...payload,
    name: payload.name.trim(),
    code: payload.code.trim().toLowerCase(),
    address: payload.address?.trim() || null,
    is_active: payload.is_active ?? true,
  };

  const res = await apiClient.post<WarehouseItem>(
    "/api/v1/admin/inventory/warehouses",
    cleanPayload
  );
  return res.data;
}

/**
 * PATCH /api/v1/admin/inventory/warehouses/{public_id}
 * Updates an existing facility's profile, code, address, or active status.
 */
export async function updateAdminWarehouse(
  publicId: string,
  payload: WarehouseUpdatePayload
): Promise<WarehouseItem> {
  if (!publicId) throw new Error("Warehouse public ID is required.");

  const cleanPayload: Record<string, any> = {};
  if (payload.name !== undefined) cleanPayload.name = payload.name?.trim() || null;
  if (payload.code !== undefined) cleanPayload.code = payload.code?.trim().toLowerCase() || null;
  if (payload.address !== undefined) cleanPayload.address = payload.address?.trim() || null;
  if (payload.is_active !== undefined) cleanPayload.is_active = payload.is_active;

  const res = await apiClient.patch<WarehouseItem>(
    `/api/v1/admin/inventory/warehouses/${publicId}`,
    cleanPayload
  );
  return res.data;
}

/**
 * DELETE /api/v1/admin/inventory/warehouses/{public_id}
 * Deletes or decommissions a facility.
 */
export async function deleteAdminWarehouse(
  publicId: string
): Promise<null> {
  if (!publicId) throw new Error("Warehouse public ID is required.");
  await apiClient.delete(`/api/v1/admin/inventory/warehouses/${publicId}`);
  return null;
}