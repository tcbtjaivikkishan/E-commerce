// src/features/checkout/services/shipping.api.ts
// ─── Real API calls for shipping rate calculation ────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";

export interface ShippingRateRequest {
  weight: number;
  deliveryPincode: number;
  type_of_package?: string;
}

export interface ShippingRateResponse {
  success: boolean;
  shippingCharge: number;
  courier: string;
  estimatedDelivery: string;
  fullResponse?: any;
}

/**
 * POST /shipping/rate — get shipping cost and courier estimate
 */
export async function calculateShippingRate(
  params: ShippingRateRequest
): Promise<ShippingRateResponse> {
  return apiRequest<ShippingRateResponse>("/shipping/rate", {
    method: "POST",
    body: {
      weight: params.weight,
      deliveryPincode: params.deliveryPincode,
      type_of_package: params.type_of_package || "SPS",
    },
  });
}
