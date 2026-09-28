// lib/services/checkoutService.ts

import { customerClient } from "@/lib/customer-client";

export interface CheckoutItemResponse {
  public_id: string;
  product_id: number;
  product_name: string;
  unit_price: number | string;
  quantity: number;
  subtotal: number | string;
}

export type CheckoutStatus =
  | "created"
  | "pricing_locked"
  | "expired"
  | "order_created";

export interface CheckoutResponse {
  public_id: string;
  status: CheckoutStatus;
  selected_address_id: number | null;
  items: CheckoutItemResponse[];
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new checkout session from the authenticated customer's cart.
 * Moves cart items to frozen checkout items with a 30-minute expiry window.
 */
export async function createCheckout(): Promise<CheckoutResponse> {
  const response = await customerClient.post<CheckoutResponse>(
    "/api/v1/shop/checkout"
  );
  return response.data;
}

/**
 * Fetches an active checkout session by its public_id.
 */
export async function getCheckout(
  checkoutPublicId: string
): Promise<CheckoutResponse> {
  const response = await customerClient.get<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}`
  );
  return response.data;
}

/**
 * Attaches a selected customer delivery address to the checkout session.
 */
export async function selectCheckoutAddress(
  checkoutPublicId: string,
  addressPublicId: string
): Promise<CheckoutResponse> {
  const response = await customerClient.patch<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/address`,
    {
      address_public_id: addressPublicId,
    }
  );
  return response.data;
}

/**
 * Confirms checkout, verifies calculated pricing, and locks pricing (status: "pricing_locked").
 */
export async function confirmCheckout(
  checkoutPublicId: string
): Promise<CheckoutResponse> {
  const response = await customerClient.post<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/confirm`
  );
  return response.data;
}