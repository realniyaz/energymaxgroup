// lib/services/adminAdjustmentService.ts
import { apiClient } from "@/lib/api-client";

export interface StockAdjustmentItem {
  public_id: string;
  warehouse_id: number;
  variant_id: number;
  adjustment_type: "INCREASE" | "DECREASE" | string;
  quantity: string | number;
  reason: string;
  before_quantity: string | number;
  after_quantity: string | number;
  created_at: string;
}

export interface StockAdjustmentListResponse {
  items: StockAdjustmentItem[];
  total: number;
}

export interface StockAdjustmentCreatePayload {
  warehouse_id: string; // Warehouse public UUID
  variant_id: string;   // Variant public UUID
  adjustment_type: "INCREASE" | "DECREASE";
  quantity: number;
  reason: string;
  idempotency_key?: string | null;
}

export interface StockAdjustmentFilterParams {
  warehouse_id?: number;
  variant_id?: number;
  adjustment_type?: string;
  limit?: number;
  offset?: number;
}

// 1. List adjustments
export async function getAdminStockAdjustments(
  params?: StockAdjustmentFilterParams
): Promise<StockAdjustmentListResponse> {
  const res = await apiClient.get<StockAdjustmentListResponse>(
    "/api/v1/admin/inventory/adjustments",
    { params }
  );
  return res.data;
}

// 2. Get single adjustment by public UUID
export async function getAdminStockAdjustment(
  publicId: string
): Promise<StockAdjustmentItem> {
  const res = await apiClient.get<StockAdjustmentItem>(
    `/api/v1/admin/inventory/adjustments/${publicId}`
  );
  return res.data;
}

// 3. Create stock adjustment
export async function createAdminStockAdjustment(
  payload: StockAdjustmentCreatePayload
): Promise<StockAdjustmentItem> {
  const res = await apiClient.post<StockAdjustmentItem>(
    "/api/v1/admin/inventory/adjustments",
    payload
  );
  return res.data;
}