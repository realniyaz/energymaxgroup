// lib/services/adminWarehouseService.ts
import { apiClient } from "@/lib/api-client";

export interface WarehouseItem {
  public_id: string;
  name: string;
  code: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseListResponse {
  items: WarehouseItem[];
  total: number;
}

export interface WarehouseCreatePayload {
  name: string;
  code: string;
  address?: string | null;
}

export interface WarehouseUpdatePayload {
  name?: string | null;
  code?: string | null;
  address?: string | null;
  is_active?: boolean | null;
}

export async function getAdminWarehouses(): Promise<WarehouseListResponse> {
  const res = await apiClient.get<WarehouseListResponse>(
    "/api/v1/admin/inventory/warehouses"
  );
  return res.data;
}

export async function getAdminWarehouse(
  publicId: string
): Promise<WarehouseItem> {
  const res = await apiClient.get<WarehouseItem>(
    `/api/v1/admin/inventory/warehouses/${publicId}`
  );
  return res.data;
}

export async function createAdminWarehouse(
  payload: WarehouseCreatePayload
): Promise<WarehouseItem> {
  const res = await apiClient.post<WarehouseItem>(
    "/api/v1/admin/inventory/warehouses",
    payload
  );
  return res.data;
}

export async function updateAdminWarehouse(
  publicId: string,
  payload: WarehouseUpdatePayload
): Promise<WarehouseItem> {
  const res = await apiClient.patch<WarehouseItem>(
    `/api/v1/admin/inventory/warehouses/${publicId}`,
    payload
  );
  return res.data;
}