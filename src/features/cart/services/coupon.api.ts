// src/features/cart/services/coupon.api.ts
// ─── Coupon API service ──────────────────────────────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CouponResponse {
  _id: string;
  name: string;
  type: "flat" | "percent";
  value: number;
  description?: string;
  show?: boolean;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * GET /coupon — get all visible coupons
 */
export async function fetchAvailableCoupons(): Promise<CouponResponse[]> {
  return apiRequest<CouponResponse[]>("/coupon", { skipAuth: true });
}

/**
 * POST /coupon/validate — validate a coupon code
 * Returns coupon details if valid, throws on invalid.
 */
export async function validateCoupon(code: string): Promise<CouponResponse> {
  return apiRequest<CouponResponse>("/coupon/validate", {
    method: "POST",
    body: { code },
  });
}
