// src/features/catalog/services/wishlist.api.ts
// ─── Real API calls for wishlist ─────────────────────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";

export interface WishlistItem {
  zoho_item_id: string;
  product?: {
    name: string;
    price: number;
    mrp?: number;
    image_url?: string;
    stock?: number;
    unit?: string;
    weight_with_unit?: string;
    [key: string]: any;
  };
}

export interface WishlistResponse {
  userId: string;
  items: WishlistItem[];
}

/**
 * GET /wishlist — get wishlist with enriched product data [JWT]
 */
export async function fetchWishlist(): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>("/wishlist");
}

/**
 * POST /wishlist — add item to wishlist [JWT]
 */
export async function addToWishlist(zoho_item_id: string): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>("/wishlist", {
    method: "POST",
    body: { zoho_item_id },
  });
}

/**
 * DELETE /wishlist/:zoho_item_id — remove item from wishlist [JWT]
 */
export async function removeFromWishlist(zoho_item_id: string): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>(`/wishlist/${zoho_item_id}`, {
    method: "DELETE",
  });
}
