// lib/services/orderService.ts
import { customerClient } from "@/lib/customer-client";

export interface OrderItem {
  public_id: string;
  product_id: number;
  product_name: string;
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

export async function createOrderFromCheckout(checkoutPublicId: string) {
  const res = await customerClient.post(`/api/v1/shop/orders/from-checkout/${checkoutPublicId}`);
  return res.data;
}

export async function getOrderTracking(orderPublicId: string): Promise<OrderTrackingResponse> {
  const res = await customerClient.get<OrderTrackingResponse>(
    `/api/v1/shop/orders/${orderPublicId}/tracking`
  );
  return res.data;
}