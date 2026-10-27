// lib/services/orderService.ts
import { customerClient } from "@/lib/customer-client";

/**
 * =========================================================
 * SCHEMAS & TYPES
 * =========================================================
 */

export interface CreateOrderPayload {
  tracking_token?: string | null;
}

export interface OrderItem {
  public_id: string;
  product_id?: number;
  product_public_id?: string;
  product_name: string;
  variant_id?: number;
  variant_public_id?: string;
  variant_sku?: string;
  flavour?: string | null;
  pack_size?: string | null;
  unit_price: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface OrderAddress {
  recipient_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string | null;
  landmark?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  label?: string;
  [key: string]: any;
}

export type OrderStatus =
  | "pending"
  | "pending_payment"
  | "paid"
  | "packed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

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
  awb_operation_status: string;
  pickup_operation_status: string;
  label_operation_status: string;
  manifest_operation_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingEvent {
  status: string;
  label: string;
  completed: boolean;
  current: boolean;
  timestamp: string | null;
  note: string | null;
}

export interface OrderTrackingResponse {
  public_id: string;
  order_number: string;
  current_status: string;
  timeline: OrderTrackingEvent[];
  shipment?: ShipmentResponse | null;
}

/**
 * Single Order Detail (matches Order entity / checkout conversion)
 */
export interface OrderResponse {
  public_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  shipping_amount?: number | string;
  shipping_fee?: number | string;
  total_amount: number | string;
  currency?: string;
  items: OrderItem[];
  shipping_address?: OrderAddress;
  shipping_address_snapshot?: OrderAddress;
  shipment?: ShipmentResponse | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Single Order Item from GET /api/v1/shop/orders/my
 */
export interface MyOrderSummaryItem {
  public_id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address_snapshot: OrderAddress;
  items: OrderItem[];
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  shipment?: ShipmentResponse | null;
  created_at: string;
  updated_at: string;
}

/**
 * Response schema for GET /api/v1/shop/orders/my
 */
export interface MyOrdersResponse {
  items: MyOrderSummaryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
  page?: number;
  page_size?: number;
}

/**
 * Utility helper to safely parse high-precision decimal strings from the backend
 */
export function parseOrderAmount(val: number | string | undefined | null): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const parsed = parseFloat(String(val).trim());
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * =========================================================
 * ORDER API METHODS
 * =========================================================
 */

/**
 * GET /api/v1/shop/orders/my
 * Fetches authenticated customer's paginated order history with attached shipment data.
 */
export async function getMyOrders(
  page: number = 1,
  pageSize: number = 20
): Promise<MyOrdersResponse> {
  const res = await customerClient.get<MyOrdersResponse>(
    "/api/v1/shop/orders/my",
    {
      params: {
        page,
        page_size: pageSize,
      },
    }
  );
  return res.data;
}

/**
 * POST /api/v1/shop/orders/from-checkout/{checkout_id}
 * Converts confirmed and locked checkout session into a finalized customer order.
 * Optionally forwards affiliate referral tracking_token for conversion attribution.
 */
export async function createOrderFromCheckout(
  checkoutPublicId: string,
  payload?: CreateOrderPayload
): Promise<OrderResponse> {
  const res = await customerClient.post<OrderResponse>(
    `/api/v1/shop/orders/from-checkout/${checkoutPublicId}`,
    payload || {}
  );
  return res.data;
}

/**
 * GET /api/v1/shop/orders
 * Returns customer order history (standard/admin listing fallback).
 */
export async function getCustomerOrders(
  page: number = 1,
  limit: number = 20
): Promise<OrderListResponse> {
  const res = await customerClient.get<OrderListResponse>(
    `/api/v1/shop/orders?page=${page}&limit=${limit}`
  );
  return res.data;
}

/**
 * GET /api/v1/shop/orders/{order_public_id}
 * Fetches complete details for a single order including shipment information.
 */
export async function getOrderByPublicId(
  orderPublicId: string
): Promise<OrderResponse> {
  const res = await customerClient.get<OrderResponse>(
    `/api/v1/shop/orders/${orderPublicId}`
  );
  return res.data;
}

/**
 * GET /api/v1/shop/orders/{order_public_id}/tracking
 * Fetches order milestone tracking, transit status, and associated carrier shipment details.
 */
export async function getOrderTracking(
  orderPublicId: string
): Promise<OrderTrackingResponse> {
  const res = await customerClient.get<OrderTrackingResponse>(
    `/api/v1/shop/orders/${orderPublicId}/tracking`
  );
  return res.data;
}

/**
 * GET /api/v1/shop/orders/track/{order_number}
 * Public order tracking lookup by order number (e.g., EMX-...).
 */
export async function trackOrderByNumber(
  orderNumber: string
): Promise<OrderTrackingResponse> {
  const res = await customerClient.get<OrderTrackingResponse>(
    `/api/v1/shop/orders/track/${encodeURIComponent(orderNumber)}`
  );
  return res.data;
}

/**
 * GET /api/v1/shop/orders/{order_public_id}/shipment
 * Fetches customer-facing shipment metadata (AWB, courier, tracking URL, and status).
 */
export async function getOrderShipment(
  orderPublicId: string
): Promise<ShipmentResponse> {
  const res = await customerClient.get<ShipmentResponse>(
    `/api/v1/shop/orders/${orderPublicId}/shipment`
  );
  return res.data;
}

/**
 * POST /api/v1/shop/orders/{order_public_id}/cancel
 * Cancels a pending order before fulfillment starts.
 */
export async function cancelCustomerOrder(
  orderPublicId: string,
  reason?: string
): Promise<OrderResponse> {
  const res = await customerClient.post<OrderResponse>(
    `/api/v1/shop/orders/${orderPublicId}/cancel`,
    { reason }
  );
  return res.data;
}