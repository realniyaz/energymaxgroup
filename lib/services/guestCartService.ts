// lib/services/guestCartService.ts

import { guestClient } from "@/lib/guest-client";

export interface GuestCartItem {
  public_id: string;
  product_public_id: string;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

export interface GuestCartResponse {
  public_id: string;
  guest_cart_token?: string | null;
  items: GuestCartItem[];
  total_items: number;
  total_amount: number | string;
  expires_at: string;
}

export async function getGuestCart(): Promise<GuestCartResponse> {
  const response = await guestClient.get<GuestCartResponse>("/api/v1/shop/cart");
  return response.data;
}

export async function addGuestCartItem(
  productPublicId: string,
  quantity: number
): Promise<GuestCartResponse> {
  const response = await guestClient.post<GuestCartResponse>(
    "/api/v1/shop/cart/items",
    { product_public_id: productPublicId, quantity }
  );
  return response.data;
}

export async function updateGuestCartItem(
  itemPublicId: string,
  quantity: number
): Promise<GuestCartResponse> {
  const response = await guestClient.patch<GuestCartResponse>(
    `/api/v1/shop/cart/items/${itemPublicId}`,
    { quantity }
  );
  return response.data;
}

export async function removeGuestCartItem(
  itemPublicId: string
): Promise<GuestCartResponse> {
  const response = await guestClient.delete<GuestCartResponse>(
    `/api/v1/shop/cart/items/${itemPublicId}`
  );
  return response.data;
}

export async function clearGuestCart(): Promise<void> {
  await guestClient.delete("/api/v1/shop/cart");
}