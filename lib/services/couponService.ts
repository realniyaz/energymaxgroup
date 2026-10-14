// lib/services/couponService.ts
import { apiClient } from "@/lib/api-client";
import { customerClient } from "@/lib/customer-client";

export type AllowedDiscountPercent = 5 | 10;

export interface CouponItem {
  public_id: string;
  code: string;
  description?: string | null;
  discount_percent: AllowedDiscountPercent;
  minimum_subtotal?: number | string | null;
  max_redemptions?: number | null;
  max_redemptions_per_customer?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponCreatePayload {
  code: string;
  description?: string | null;
  discount_percent: AllowedDiscountPercent;
  minimum_subtotal?: number | null;
  max_redemptions?: number | null;
  max_redemptions_per_customer?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}

export interface CouponUpdatePayload {
  description?: string | null;
  discount_percent?: AllowedDiscountPercent;
  minimum_subtotal?: number | null;
  max_redemptions?: number | null;
  max_redemptions_per_customer?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}

export interface CouponRedemptionItem {
  id: number;
  coupon_code: string;
  customer_id: number;
  checkout_id: number;
  order_id?: number | null;
  status: "reserved" | "redeemed" | "released";
  discount_amount: number | string;
  reserved_until: string;
  redeemed_at?: string | null;
  created_at: string;
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

/* =========================================================
 * ADMIN COUPON ENDPOINTS (Uses apiClient with Admin Token)
 * ========================================================= */

/**
 * GET /api/v1/admin/coupons
 */
export async function getAdminCoupons(params?: {
  limit?: number;
  offset?: number;
}): Promise<CouponItem[]> {
  const res = await apiClient.get<CouponItem[]>("/api/v1/admin/coupons", {
    params: {
      limit: params?.limit ?? 100,
      offset: params?.offset ?? 0,
    },
  });
  return res.data;
}

/**
 * POST /api/v1/admin/coupons
 */
export async function createAdminCoupon(
  payload: CouponCreatePayload
): Promise<CouponItem> {
  const res = await apiClient.post<CouponItem>("/api/v1/admin/coupons", payload);
  return res.data;
}

/**
 * GET /api/v1/admin/coupons/{coupon_public_id}
 */
export async function getAdminCouponById(
  couponPublicId: string
): Promise<CouponItem> {
  const res = await apiClient.get<CouponItem>(
    `/api/v1/admin/coupons/${couponPublicId}`
  );
  return res.data;
}

/**
 * PATCH /api/v1/admin/coupons/{coupon_public_id}
 */
export async function updateAdminCoupon(
  couponPublicId: string,
  payload: CouponUpdatePayload
): Promise<CouponItem> {
  const res = await apiClient.patch<CouponItem>(
    `/api/v1/admin/coupons/${couponPublicId}`,
    payload
  );
  return res.data;
}

/**
 * POST /api/v1/admin/coupons/{coupon_public_id}/activate
 */
export async function activateAdminCoupon(
  couponPublicId: string
): Promise<CouponItem> {
  const res = await apiClient.post<CouponItem>(
    `/api/v1/admin/coupons/${couponPublicId}/activate`
  );
  return res.data;
}

/**
 * POST /api/v1/admin/coupons/{coupon_public_id}/deactivate
 */
export async function deactivateAdminCoupon(
  couponPublicId: string
): Promise<CouponItem> {
  const res = await apiClient.post<CouponItem>(
    `/api/v1/admin/coupons/${couponPublicId}/deactivate`
  );
  return res.data;
}

/**
 * GET /api/v1/admin/coupons/{coupon_public_id}/redemptions
 */
export async function getAdminCouponRedemptions(
  couponPublicId: string,
  params?: { limit?: number; offset?: number }
): Promise<CouponRedemptionItem[]> {
  const res = await apiClient.get<CouponRedemptionItem[]>(
    `/api/v1/admin/coupons/${couponPublicId}/redemptions`,
    { params }
  );
  return res.data;
}

/* =========================================================
 * SHOP CUSTOMER ENDPOINTS (Uses customerClient)
 * ========================================================= */

/**
 * POST /api/v1/checkout/{checkout_public_id}/coupon
 */
export async function applyCheckoutCoupon(
  checkoutPublicId: string,
  code: string
): Promise<CouponApplyResponse> {
  const res = await customerClient.post<CouponApplyResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/coupon`, // <-- added /shop
    { code: code.trim().toUpperCase() }
  );
  return res.data;
}

/**
 * DELETE /api/v1/checkout/{checkout_public_id}/coupon
 */
export async function removeCheckoutCoupon(
  checkoutPublicId: string
): Promise<CouponApplyResponse> {
  const res = await customerClient.delete<CouponApplyResponse>(
    `/api/v1/shop/checkout/${checkoutPublicId}/coupon` // <-- added /shop
  );
  return res.data;
}