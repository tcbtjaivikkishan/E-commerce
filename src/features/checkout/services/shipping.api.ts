// src/features/checkout/services/shipping.api.ts
// ─── Real API calls for shipping rate calculation ────────────────────────────

import { apiRequest } from '../../../shared/services/api.client';

export interface ShippingRateRequest {
  weight: number;             // grams
  deliveryPincode: number;    // numeric
  type_of_package: 'SPS' | 'B2B';
}

export interface ShippingRateResponse {
  success: boolean;
  shippingCharge: number;
  courier: string;
  estimatedDelivery: string;
  fullResponse?: Record<string, unknown>;
}

/**
 * POST /shipping/rate — get live shipping cost and courier estimate.
 *
 * @param weightGrams      Total order weight in grams
 * @param deliveryPincode  Delivery pin code as a number
 *
 * Business rule:
 *   weight > 20,000 g  (i.e. > 20 kg)  → type_of_package = 'B2B'
 *   otherwise                           → type_of_package = 'SPS'
 */
export async function calculateShippingRate(
  weightGrams: number,
  deliveryPincode: number
): Promise<ShippingRateResponse> {
  const type_of_package: 'SPS' | 'B2B' = weightGrams > 20_000 ? 'B2B' : 'SPS';

  return apiRequest<ShippingRateResponse>('/shipping/rate', {
    method: 'POST',
    body: {
      weight: weightGrams,
      deliveryPincode,
      type_of_package,
    } as ShippingRateRequest,
  });
}
