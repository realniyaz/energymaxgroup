// lib/services/orderService.ts
import { customerClient } from "@/lib/customer-client";

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
}

export interface OrderAddress {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  label?: string;
}

export interface OrderResponse {
  public_id: string;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  shipping_fee: number | string;
  total_amount: number | string;
  currency: string;
  items: OrderItem[];
  shipping_address?: OrderAddress;
  created_at: string;
  updated_at?: string;
}

export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
  page?: number;
  page_size?: number;
}

/**
 * POST /api/v1/shop/orders/from-checkout/{checkout_id}
 * Converts confirmed and locked checkout session into a finalized customer order.
 */
export async function createOrderFromCheckout(
  checkoutPublicId: string
): Promise<OrderResponse> {
  const res = await customerClient.post<OrderResponse>(
    `/api/v1/shop/orders/from-checkout/${checkoutPublicId}`
  );
  return res.data;
}

/**
 * GET /api/v1/shop/orders
 * Returns customer order history.
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
 * Fetches complete details for a single order.
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
 * Fetches order milestone tracking and logistics events.
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