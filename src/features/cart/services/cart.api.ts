// src/features/cart/services/cart.api.ts
// ─── Real API calls for cart (guest + authenticated) ─────────────────────────

import { apiRequest } from "../../../shared/services/api.client";
import {
  getAccessToken,
  getGuestSessionId,
  setGuestSessionId,
} from "../../../shared/services/token.service";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItemResponse {
  product_id: string;
  quantity: number;
  name?: string;
  price?: number;
  line_total?: number;
  image_url?: string;
}

export interface CartResponse {
  cart_id?: string;
  _id?: string;
  items: CartItemResponse[];
  total_amount?: number;
  totalWeight?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

// ─── Guest Cart ──────────────────────────────────────────────────────────────

/**
 * POST /cart/guest — create a new guest cart session
 */
export async function createGuestSession(): Promise<string> {
  const data = await apiRequest<{ guest_session_id: string }>("/cart/guest", {
    method: "POST",
    skipAuth: true,
  });
  await setGuestSessionId(data.guest_session_id);
  return data.guest_session_id;
}

/**
 * Ensure a guest session exists; create one if not
 */
export async function ensureGuestSession(): Promise<string> {
  let guestId = await getGuestSessionId();
  if (!guestId) {
    guestId = await createGuestSession();
  }
  return guestId;
}

/**
 * GET /cart/guest/:guestId — get guest cart with enriched product data
 */
export async function fetchGuestCart(guestId: string): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/cart/guest/${guestId}`, { skipAuth: true });
}

/**
 * PATCH /cart/guest/items — add/update/remove item in guest cart
 */
export async function updateGuestCartItem(
  guestId: string,
  productId: string,
  quantity: number
): Promise<CartResponse> {
  return apiRequest<CartResponse>("/cart/guest/items", {
    method: "PATCH",
    body: {
      guest_session_id: guestId,
      product_id: productId,
      quantity,
    },
    skipAuth: true,
  });
}

// ─── Authenticated Cart ──────────────────────────────────────────────────────

/**
 * GET /cart — get authenticated user's cart [JWT]
 */
export async function fetchUserCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>("/cart");
}

/**
 * PATCH /cart/items — add/update/remove item [JWT]
 */
export async function updateUserCartItem(
  productId: string,
  quantity: number
): Promise<CartResponse> {
  return apiRequest<CartResponse>("/cart/items", {
    method: "PATCH",
    body: { product_id: productId, quantity },
  });
}

// ─── Unified Cart Operations ─────────────────────────────────────────────────

/**
 * Fetch the current cart (auto-detects guest vs authenticated)
 */
export async function fetchCart(): Promise<CartResponse> {
  if (await isAuthenticated()) {
    return fetchUserCart();
  }
  const guestId = await ensureGuestSession();
  return fetchGuestCart(guestId);
}

/**
 * Update a cart item (auto-detects guest vs authenticated)
 */
export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<CartResponse> {
  if (await isAuthenticated()) {
    return updateUserCartItem(productId, quantity);
  }
  const guestId = await ensureGuestSession();
  return updateGuestCartItem(guestId, productId, quantity);
}
