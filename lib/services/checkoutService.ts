// lib/services/checkoutService.ts
import { customerClient } from "@/lib/customer-client";

export interface CheckoutItem {
  public_id: string;
  product_public_id?: string;
  product_id?: number;
  variant_public_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

export type CheckoutStatus =
  | "created"
  | "pricing_locked"
  | "expired"
  | "order_created"
  | "completed"
  | "cancelled";

export interface CheckoutResponse {
  public_id: string;
  customer_id?: number | string;
  status: CheckoutStatus;
  selected_address_id?: number | string | null;
  items: CheckoutItem[];
  subtotal: number | string;
  tax_amount: number | string;
  shipping_amount?: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  coupon_id?: number | null;
  coupon_code?: string | null;
  discount_percent?: number | null;
  currency?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface CouponApplyResponse {
  checkout_public_id: string;
  coupon_code: string | null;
  discount_percent: number | null;
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
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

/**
 * POST /api/v1/shop/checkout/{checkout_public_id}/coupon
 * Applies a promotional coupon to the checkout session.
 */
export async function applyCheckoutCoupon(
  checkoutPublicId: string,
  code: string
): Promise<CouponApplyResponse> {
  const response = await customerClient.post<CouponApplyResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/coupon`,
    { code: code.trim().toUpperCase() }
  );
  return response.data;
}

/**
 * DELETE /api/v1/shop/checkout/{checkout_public_id}/coupon
 * Removes the currently applied coupon from the checkout session.
 */
export async function removeCheckoutCoupon(
  checkoutPublicId: string
): Promise<CouponApplyResponse> {
  const response = await customerClient.delete<CouponApplyResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/coupon`
  );
  return response.data;
}