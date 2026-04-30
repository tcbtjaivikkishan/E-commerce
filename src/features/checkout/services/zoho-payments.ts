// src/features/checkout/services/zoho-payments.ts
// ─── Zoho Payments SDK wrapper ───────────────────────────────────────────────

import { AppConfig } from '../../../core/config';
import { apiRequest } from '../../../shared/services/api.client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ZohoPaymentResult {
  status: 'success' | 'failed' | 'cancelled';
  paymentId?: string;
  orderId?: string;
  errorMessage?: string;
}

interface VerifyPaymentResponse {
  status: 'paid' | 'failed' | 'pending';
  orderId: string;
}

// ─── SDK helpers ─────────────────────────────────────────────────────────────

let sdkInitialised = false;

/**
 * Initialise the Zoho Payments SDK.
 * Safe to call multiple times — only the first call does anything.
 */
export async function initZohoPayments(): Promise<void> {
  if (sdkInitialised) return;

  try {
    const { initialize } = await import('zoho-payments-react-native-sdk');

    console.log('[ZohoPayments] Initializing with:');
    console.log('  API Key:', AppConfig.ZOHO_PAYMENTS_API_KEY.substring(0, 15) + '...');
    console.log('  Account ID:', AppConfig.ZOHO_PAYMENTS_ACCOUNT_ID);
    console.log('  Region:', AppConfig.ZOHO_PAYMENTS_REGION);
    console.log('  Mode:', AppConfig.ZOHO_PAYMENTS_MODE);

    initialize(
      AppConfig.ZOHO_PAYMENTS_API_KEY,
      AppConfig.ZOHO_PAYMENTS_ACCOUNT_ID,
      AppConfig.ZOHO_PAYMENTS_REGION,    // 'india' | 'us'
      AppConfig.ZOHO_PAYMENTS_MODE,      // 'sandbox' | 'live'
    );

    sdkInitialised = true;
    console.log('[ZohoPayments] SDK initialised');
  } catch (err: any) {
    console.error('[ZohoPayments] SDK init failed:', err.message);
    throw err;
  }
}

/**
 * Open the Zoho Payments checkout sheet for a given payment session.
 *
 * @param paymentSessionId  — returned by POST /orders on your backend
 * @returns ZohoPaymentResult
 */
export async function openCheckout(
  paymentSessionId: string,
): Promise<ZohoPaymentResult> {
  // Ensure SDK is ready
  await initZohoPayments();

  try {
    const { showCheckout } = await import('zoho-payments-react-native-sdk');
    console.log('[ZohoPayments] Calling showCheckout with sessionId:', paymentSessionId);
    const result = await showCheckout({ paymentSessionId });

    console.log('[ZohoPayments] Checkout result:', JSON.stringify(result));

    // The SDK returns different shapes depending on outcome.
    // Normalise to our own type.
    if (result?.status === 'success' || result?.paymentStatus === 'success') {
      return {
        status: 'success',
        paymentId: result.paymentId || result.payment_id,
        orderId: result.orderId || result.order_id,
      };
    }

    if (result?.status === 'cancelled' || result?.paymentStatus === 'cancelled') {
      return { status: 'cancelled' };
    }

    return {
      status: 'failed',
      errorMessage: result?.message || result?.errorMessage || 'Payment failed',
    };
  } catch (err: any) {
    console.error('[ZohoPayments] Checkout error:', err.message);

    // User dismissing the sheet throws on some platforms
    if (err.message?.includes('cancel') || err.code === 'USER_CANCELLED') {
      return { status: 'cancelled' };
    }

    return {
      status: 'failed',
      errorMessage: err.message || 'Payment checkout failed',
    };
  }
}

// ─── Polling helper ──────────────────────────────────────────────────────────

/**
 * Poll the dedicated `/payments/verify/:orderId` endpoint for payment
 * confirmation. Unlike GET /orders/:id, this endpoint actively checks
 * the Zoho payment session status and auto-confirms the order if paid.
 *
 * @param orderId     — order to poll (e.g. "ORD-xxxxx")
 * @param maxAttempts — how many times to try (default 10)
 * @param intervalMs  — delay between attempts (default 2 s)
 */
export async function pollPaymentStatus(
  orderId: string,
  maxAttempts = 10,
  intervalMs = 2000,
): Promise<'paid' | 'failed' | 'pending'> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      console.log(`[POLL] Attempt ${i + 1}/${maxAttempts} for ${orderId}`);
      const result = await apiRequest<VerifyPaymentResponse>(
        `/payments/verify/${orderId}`,
      );

      console.log(`[POLL] Response:`, result.status);

      if (result.status === 'paid') return 'paid';
      if (result.status === 'failed') return 'failed';
    } catch (err: any) {
      // 404 = order not found — stop polling
      if (err?.message?.includes('404') || err?.message?.includes('Not Found')) {
        console.warn('[POLL] Order not found, stopping poll');
        return 'pending';
      }
      // network blip — keep trying
      console.warn(`[POLL] Error on attempt ${i + 1}:`, err?.message);
    }

    // Wait before next attempt
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return 'pending'; // still not confirmed after all attempts
}

