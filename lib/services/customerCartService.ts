// lib/services/customerCartService.ts

import { customerClient } from "@/lib/customer-client";
import { getGuestCartToken, setGuestCartToken } from "@/lib/guest-client";

export interface CustomerCartItem {
  public_id: string;
  product_public_id: string;
  variant_public_id: string;
  product_name?: string;
  variant_sku?: string;
  flavour?: string | null;
  pack_size?: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal?: number | string;
}

export interface CustomerCartResponse {
  public_id: string;
  items: CustomerCartItem[];
  total_items: number;
  subtotal: number | string;
  created_at: string;
  updated_at: string;
}

export interface AddCustomerCartItemPayload {
  product_public_id: string;
  variant_public_id: string;
  quantity: number;
}

export async function getCustomerCart(): Promise<CustomerCartResponse> {
  const response = await customerClient.get<CustomerCartResponse>(
    "/api/v1/shop/customer/cart"
  );
  return response.data;
}

export async function addCustomerCartItem(
  productPublicId: string,
  variantPublicId: string,
  quantity: number = 1
): Promise<CustomerCartResponse> {
  const response = await customerClient.post<CustomerCartResponse>(
    "/api/v1/shop/customer/cart/items",
    {
      product_public_id: productPublicId,
      variant_public_id: variantPublicId,
      quantity,
    }
  );
  return response.data;
}

export async function updateCustomerCartItem(
  itemPublicId: string,
  quantity: number
): Promise<CustomerCartResponse> {
  const response = await customerClient.patch<CustomerCartResponse>(
    `/api/v1/shop/customer/cart/items/${itemPublicId}`,
    { quantity }
  );
  return response.data;
}

export async function removeCustomerCartItem(
  itemPublicId: string
): Promise<CustomerCartResponse> {
  const response = await customerClient.delete<CustomerCartResponse>(
    `/api/v1/shop/customer/cart/items/${itemPublicId}`
  );
  return response.data;
}

export async function clearCustomerCart(): Promise<void> {
  await customerClient.delete("/api/v1/shop/customer/cart");
}

/**
 * Merges active guest cart into authenticated customer cart.
 * Passes X-Guest-Cart-Token header as required by backend.
 */
export async function mergeGuestCartIntoCustomerCart(): Promise<CustomerCartResponse | null> {
  const guestToken = getGuestCartToken();
  if (!guestToken) return null;

  try {
    const response = await customerClient.post<CustomerCartResponse>(
      "/api/v1/shop/customer/cart/merge",
      {},
      {
        headers: {
          "X-Guest-Cart-Token": guestToken,
        },
      }
    );

    setGuestCartToken(null);
    return response.data;
  } catch (error) {
    console.error("Cart merge warning:", error);
    return null;
  }
}