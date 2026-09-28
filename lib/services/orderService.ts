// lib/services/orderService.ts

import { customerClient } from "@/lib/customer-client";

export interface OrderAddressSnapshot {
  public_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItemResponse {
  public_id: string;
  product_id: number;
  product_name: string;
  unit_price: number | string;
  quantity: number;
  subtotal: number | string;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface OrderResponse {
  public_id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address_snapshot: OrderAddressSnapshot;
  items: OrderItemResponse[];
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  created_at: string;
  updated_at: string;
}

/**
 * Converts a "pricing_locked" checkout into a confirmed Order.
 * Generates an immutable address snapshot and order tracking number (e.g., EMX-XXXX).
 */
export async function createOrderFromCheckout(
  checkoutPublicId: string
): Promise<OrderResponse> {
  const response = await customerClient.post<OrderResponse>(
    `/api/v1/shop/orders/from-checkout/${checkoutPublicId}`
  );
  return response.data;
}

/**
 * Fetches order tracking details by order public ID.
 */
export async function getOrderTracking(
  orderPublicId: string
): Promise<any> {
  const response = await customerClient.get(
    `/api/v1/shop/orders/${orderPublicId}/tracking`
  );
  return response.data;
}

/**
 * Public tracking lookup by order number (e.g., EMX-3849AB82C).
 */
export async function trackOrderByNumber(
  orderNumber: string
): Promise<any> {
  const response = await customerClient.get(
    `/api/v1/shop/orders/track/${orderNumber}`
  );
  return response.data;
}