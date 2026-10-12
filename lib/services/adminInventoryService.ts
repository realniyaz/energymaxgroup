// lib/services/adminInventoryService.ts
import { apiClient } from "@/lib/api-client";

export interface InventoryBalanceItem {
  product_id: number;
  product_name: string;
  variant_id: number;
  flavour: string;
  sku: string;
  warehouse_id: number;
  warehouse_name: string;
  warehouse_code: string;
  on_hand: string | number;
  reserved: string | number;
  damaged: string | number;
  incoming: string | number;
  available: string | number;
  reorder_level: string | number;
  reorder_quantity: string | number;
  safety_stock: string | number;
  created_at: string;
  updated_at: string;
}

export interface InventoryBalanceListResponse {
  items: InventoryBalanceItem[];
  total: number;
}

export interface StockInPayload {
  warehouse_id: number;
  variant_id: number;
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  idempotency_key?: string;
  note?: string;
}

export interface StockOutPayload {
  warehouse_id: number;
  variant_id: number;
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  idempotency_key?: string;
  note?: string;
}

export interface StockAdjustmentPayload {
  warehouse_id: string; // Warehouse public UUID
  variant_id: string;   // Variant public UUID
  adjustment_type: "INCREASE" | "DECREASE";
  quantity: number;
  reason: string;
  idempotency_key?: string;
}

export interface InventoryMovementItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_id: number;
  flavour: string;
  sku: string;
  warehouse_id: number;
  warehouse_name: string;
  warehouse_code: string;
  movement_type:
    | "STOCK_IN"
    | "STOCK_OUT"
    | "RESERVATION"
    | "RELEASE"
    | "SALE"
    | "ADJUSTMENT"
    | string;
  quantity: string | number;
  before_quantity: string | number;
  after_quantity: string | number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface InventoryMovementListResponse {
  items: InventoryMovementItem[];
  total: number;
}

export interface MovementFilterParams {
  warehouse_id?: number;
  variant_id?: number;
  movement_type?: string;
  reference_type?: string;
  reference_id?: string;
  limit?: number;
  offset?: number;
}

export interface StockOperationPayload {
  warehouse_id: number;
  variant_id: number;
  quantity: number;
  movement_type?: "STOCK_IN" | "STOCK_OUT";
  reference_type?: string | null;
  reference_id?: string | null;
  idempotency_key?: string | null;
  note?: string | null;
}

export interface StockOperationResponse {
  warehouse_id: number;
  variant_id: number;
  on_hand: string | number;
  reserved: string | number;
  damaged: string | number;
  available: string | number;
  movement_id: number;
  movement_type: string;
  movement_quantity: string | number;
  before_quantity: string | number;
  after_quantity: string | number;
  created_at: string;
}

// 1. List inventory balances (optionally filtered by warehouse or variant)
export async function getAdminInventoryBalances(params?: {
  warehouse_id?: number;
  variant_id?: number;
}): Promise<InventoryBalanceListResponse> {
  const res = await apiClient.get<InventoryBalanceListResponse>(
    "/api/v1/admin/inventory/balances",
    { params }
  );
  return res.data;
}

// 2. Perform Stock-In receipt
export async function stockInInventory(payload: StockInPayload) {
  const res = await apiClient.post("/api/v1/admin/inventory/stock-in", payload);
  return res.data;
}

// 3. Perform Stock-Out deduction
export async function stockOutInventory(payload: StockOutPayload) {
  const res = await apiClient.post("/api/v1/admin/inventory/stock-out", payload);
  return res.data;
}

// 4. Create Stock Adjustment
export async function createStockAdjustment(payload: StockAdjustmentPayload) {
  const res = await apiClient.post("/api/v1/admin/inventory/adjustments", payload);
  return res.data;
}

export async function getAdminInventoryMovements(
  params?: MovementFilterParams
): Promise<InventoryMovementListResponse> {
  const res = await apiClient.get<InventoryMovementListResponse>(
    "/api/v1/admin/inventory/movements",
    { params }
  );
  return res.data;
}

export async function getAdminInventoryMovement(
  movementId: string | number
): Promise<InventoryMovementItem> {
  const res = await apiClient.get<InventoryMovementItem>(
    `/api/v1/admin/inventory/movements/${movementId}`
  );
  return res.data;
}

export async function executeStockIn(
  payload: StockOperationPayload
): Promise<StockOperationResponse> {
  const res = await apiClient.post<StockOperationResponse>(
    "/api/v1/admin/inventory/stock/in",
    {
      ...payload,
      movement_type: payload.movement_type || "STOCK_IN",
    }
  );
  return res.data;
}

// 2. POST /api/v1/admin/inventory/stock/out
export async function executeStockOut(
  payload: StockOperationPayload
): Promise<StockOperationResponse> {
  const res = await apiClient.post<StockOperationResponse>(
    "/api/v1/admin/inventory/stock/out",
    {
      ...payload,
      movement_type: payload.movement_type || "STOCK_OUT",
    }
  );
  return res.data;
}