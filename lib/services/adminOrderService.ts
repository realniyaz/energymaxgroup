// lib/services/adminOrderService.ts
import { apiClient } from "@/lib/api-client";

/**
 * =========================================================
 * SCHEMAS & INTERFACES
 * =========================================================
 */

export interface AdminOrderItem {
  public_id: string;
  product_id?: number;
  product_name: string;
  unit_price: string | number;
  quantity: number;
  subtotal: string | number;
}

export interface ShippingAddressSnapshot {
  public_id?: string;
  label?: string;
  recipient_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string | null;
  landmark?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface OrderStatusHistoryItem {
  id: number;
  status: string;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface ShipmentResponse {
  id: number;
  order_id: number;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  awb_code: string | null;
  courier_name: string | null;
  status: string;
  tracking_url: string | null;
  length_cm: number | string;
  breadth_cm: number | string;
  height_cm: number | string;
  weight_kg: number | string;
  pickup_token_number: string | null;
  pickup_scheduled_at: string | null;
  label_url: string | null;
  manifest_url: string | null;
  awb_operation_status: "idle" | "in_progress" | "succeeded" | "failed" | string;
  pickup_operation_status: "idle" | "in_progress" | "succeeded" | "failed" | string;
  label_operation_status: "idle" | "in_progress" | "succeeded" | "failed" | string;
  manifest_operation_status: "idle" | "in_progress" | "succeeded" | "failed" | string;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderDetailResponse {
  id?: number;
  public_id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address_snapshot: ShippingAddressSnapshot;
  items: AdminOrderItem[];
  subtotal: string | number;
  discount_amount: string | number;
  shipping_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  status_history?: OrderStatusHistoryItem[];
  created_at: string;
  updated_at: string;
  shipment?: ShipmentResponse | null;
}

export interface AdminOrderListItem {
  id?: number;
  public_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  status: string;
  subtotal: string | number;
  discount_amount: string | number;
  shipping_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderListItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AdminOrderStatusUpdateRequest {
  status: string;
  note?: string;
}

export interface ShipmentCreateRequest {
  length_cm: number;
  breadth_cm: number;
  height_cm: number;
  weight_kg: number;
}

export interface AWBAssignmentRequest {
  courier_id?: number | null;
}

export interface GetAdminOrdersParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}

/**
 * =========================================================
 * ADMIN ORDER & SHIPMENT API METHODS
 * =========================================================
 */

/**
 * GET /api/v1/admin/orders
 * List orders with pagination, status filter, and keyword search.
 * Safely handles both array and wrapped object responses.
 */
export async function getAdminOrders(
  params?: GetAdminOrdersParams
): Promise<AdminOrderListResponse> {
  const cleanParams: Record<string, any> = {};
  if (params?.page) cleanParams.page = params.page;
  if (params?.page_size) cleanParams.page_size = params.page_size;
  if (params?.status) cleanParams.status = params.status;
  if (params?.search) cleanParams.search = params.search.trim();

  const res = await apiClient.get<any>("/api/v1/admin/orders", {
    params: cleanParams,
  });

  const data = res.data;

  // Raw array response fallback
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: params?.page ?? 1,
      page_size: params?.page_size ?? data.length,
      total_pages: 1,
    };
  }

  // Wrapped pagination response
  const pageSize = params?.page_size || 15;
  const totalCount = data.total ?? (data.items ? data.items.length : 0);
  const calculatedPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    items: data.items || [],
    total: totalCount,
    page: data.page ?? (params?.page || 1),
    page_size: data.page_size ?? pageSize,
    total_pages: data.total_pages ?? calculatedPages,
  };
}

/**
 * GET /api/v1/admin/orders/{order_id}
 * Retrieve complete details of a single order by its public UUID or numeric ID.
 */
export async function getAdminOrder(
  orderId: string | number
): Promise<AdminOrderDetailResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.get<AdminOrderDetailResponse>(
    `/api/v1/admin/orders/${orderId}`
  );
  return res.data;
}

/**
 * PATCH /api/v1/admin/orders/{order_id}/status
 * Transition an order's lifecycle status (e.g., 'paid' -> 'packed').
 */
export async function updateAdminOrderStatus(
  orderId: string | number,
  payload: AdminOrderStatusUpdateRequest
): Promise<AdminOrderDetailResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.patch<AdminOrderDetailResponse>(
    `/api/v1/admin/orders/${orderId}/status`,
    {
      status: payload.status,
      note: payload.note?.trim() || undefined,
    }
  );
  return res.data;
}

/**
 * POST /api/v1/admin/orders/{order_id}/shipment
 * Initialize a Shiprocket order and shipment for a packed order.
 */
export async function createOrderShipment(
  orderId: string | number,
  payload: ShipmentCreateRequest
): Promise<ShipmentResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.post<ShipmentResponse>(
    `/api/v1/admin/orders/${orderId}/shipment`,
    {
      length_cm: Number(payload.length_cm),
      breadth_cm: Number(payload.breadth_cm),
      height_cm: Number(payload.height_cm),
      weight_kg: Number(payload.weight_kg),
    }
  );
  return res.data;
}

/**
 * POST /api/v1/admin/orders/{order_id}/shipment/awb
 * Generate an AWB and assign a courier.
 */
export async function assignOrderAWB(
  orderId: string | number,
  payload: AWBAssignmentRequest = {}
): Promise<ShipmentResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.post<ShipmentResponse>(
    `/api/v1/admin/orders/${orderId}/shipment/awb`,
    {
      courier_id: payload.courier_id ? Number(payload.courier_id) : null,
    }
  );
  return res.data;
}

/**
 * POST /api/v1/admin/orders/{order_id}/shipment/pickup
 * Request courier warehouse pickup.
 */
export async function requestOrderPickup(
  orderId: string | number
): Promise<ShipmentResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.post<ShipmentResponse>(
    `/api/v1/admin/orders/${orderId}/shipment/pickup`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/orders/{order_id}/shipment/label
 * Generate and retrieve the signed shipping label PDF URL.
 */
export async function generateOrderShipmentLabel(
  orderId: string | number
): Promise<ShipmentResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.post<ShipmentResponse>(
    `/api/v1/admin/orders/${orderId}/shipment/label`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/orders/{order_id}/shipment/manifest
 * Generate and retrieve the signed courier manifest document PDF URL.
 */
export async function generateOrderShipmentManifest(
  orderId: string | number
): Promise<ShipmentResponse> {
  if (!orderId) throw new Error("Order ID is required.");
  const res = await apiClient.post<ShipmentResponse>(
    `/api/v1/admin/orders/${orderId}/shipment/manifest`
  );
  return res.data;
}