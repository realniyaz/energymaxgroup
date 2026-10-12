// lib/services/checkoutService.ts
import { apiClient } from "@/lib/api-client";

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
 * Initializes a new checkout session from the active cart.
 */
export async function createCheckout(): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponse>(
    "/api/v1/shop/checkout"
  );
  return response.data;
}

/**
 * GET /api/v1/shop/checkout/{checkout_id}
 */
export async function getCheckout(checkoutId: string): Promise<CheckoutResponse> {
  const response = await apiClient.get<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutId}`
  );
  return response.data;
}

/**
 * POST /api/v1/shop/checkout/{checkout_id}/select-address
 */
export async function selectCheckoutAddress(
  checkoutId: string,
  addressPublicId: string
): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutId}/select-address`,
    { address_public_id: addressPublicId }
  );
  return response.data;
}

/**
 * POST /api/v1/shop/checkout/{checkout_id}/confirm
 * Locks items, prices, and creates the inventory reservation.
 */
export async function confirmCheckout(checkoutId: string): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponse>(
    `/api/v1/shop/checkout/${checkoutId}/confirm`
  );
  return response.data;
}