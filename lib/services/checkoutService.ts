// lib/services/checkoutService.ts
import { customerClient } from "@/lib/customer-client";

export interface CheckoutItem {
  public_id: string;
  product_public_id: string;
  variant_public_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

export interface CheckoutResponse {
  public_id: string;
  customer_id?: number | string;
  status: "draft" | "confirmed" | "completed" | "expired" | "cancelled";
  selected_address_id?: number | string | null;
  items: CheckoutItem[];
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  currency: string;
  expires_at?: string;
  created_at: string;
}

/**
 * POST /api/v1/shop/checkout
 * Initializes a new checkout session.
 */
export async function createCheckout(): Promise<CheckoutResponse> {
  const response = await customerClient.post<CheckoutResponse>(
    "/api/v1/shop/checkout"
  );
  return response.data;
}

/**
 * GET /api/v1/shop/checkout/{checkout_public_id}
 */
export async function getCheckout(checkoutPublicId: string): Promise<CheckoutResponse> {
  const response = await customerClient.get<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}`
  );
  return response.data;
}

/**
 * PATCH /api/v1/shop/checkout/{checkout_public_id}/address
 * Attaches the selected customer address to the checkout session.
 */
export async function selectCheckoutAddress(
  checkoutPublicId: string,
  addressPublicId: string
): Promise<CheckoutResponse> {
  const response = await customerClient.patch<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/address`,
    {
      address_public_id: addressPublicId,
      address_id: addressPublicId,
    }
  );
  return response.data;
}

/**
 * POST /api/v1/shop/checkout/{checkout_public_id}/confirm
 * Locks prices and reserves stock allocations.
 */
export async function confirmCheckout(checkoutPublicId: string): Promise<CheckoutResponse> {
  const response = await customerClient.post<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/confirm`
  );
  return response.data;
}