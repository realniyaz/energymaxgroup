// lib/services/adminOrderService.ts
import { apiClient } from "@/lib/api-client";

// ... keep all your interfaces unchanged ...
export interface AdminOrderItem {
  public_id: string;
  product_id: number;
  product_name: string;
  unit_price: string | number;
  quantity: number;
  subtotal: string | number;
}

export interface AdminOrderListItem {
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

export interface ShippingAddressSnapshot {
  public_id?: string;
  label?: string;
  recipient_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  landmark?: string;
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

export interface AdminOrderDetailResponse {
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
}

export interface AdminOrderStatusUpdateRequest {
  status: string;
  note?: string;
}

export async function getAdminOrders(params: {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}): Promise<AdminOrderListResponse> {
  const res = await apiClient.get<AdminOrderListResponse>("/api/v1/admin/orders", {
    params,
  });
  return res.data;
}

export async function getAdminOrder(orderPublicId: string): Promise<AdminOrderDetailResponse> {
  const res = await apiClient.get<AdminOrderDetailResponse>(
    `/api/v1/admin/orders/${orderPublicId}`
  );
  return res.data;
}

export async function updateAdminOrderStatus(
  orderPublicId: string,
  payload: AdminOrderStatusUpdateRequest
): Promise<AdminOrderDetailResponse> {
  const res = await apiClient.patch<AdminOrderDetailResponse>(
    `/api/v1/admin/orders/${orderPublicId}/status`,
    payload
  );
  return res.data;
}