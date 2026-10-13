// lib/services/wishlistService.ts
import { customerClient } from "@/lib/customer-client";

export interface WishlistProduct {
  public_id: string;
  name: string;
  slug: string;
  price?: number | string | null;
  mrp?: number | string | null;
  primary_image_url?: string | null;
}

export interface WishlistItem {
  public_id: string;
  created_at: string;
  product: WishlistProduct;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

export interface WishlistMessageResponse {
  message: string;
  item?: WishlistItem;
}

/**
 * GET /api/v1/shop/customer/wishlist/my
 * Fetches the authenticated customer's wishlist items.
 */
export async function getMyWishlist(): Promise<WishlistResponse> {
  const res = await customerClient.get<WishlistResponse>(
    "/api/v1/shop/customer/wishlist/my"
  );
  return res.data;
}

/**
 * POST /api/v1/shop/customer/wishlist/my/items/{product_id}
 * Adds a product to the wishlist using its numeric product ID.
 */
export async function addToWishlist(
  productId: number
): Promise<WishlistMessageResponse> {
  const res = await customerClient.post<WishlistMessageResponse>(
    `/api/v1/shop/customer/wishlist/my/items/${productId}`
  );
  return res.data;
}

/**
 * DELETE /api/v1/shop/customer/wishlist/my/items/{product_id}
 * Removes a product from the wishlist using its numeric product ID.
 */
export async function removeFromWishlist(
  productId: number
): Promise<WishlistMessageResponse> {
  const res = await customerClient.delete<WishlistMessageResponse>(
    `/api/v1/shop/customer/wishlist/my/items/${productId}`
  );
  return res.data;
}