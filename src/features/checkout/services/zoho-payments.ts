// src/features/checkout/services/zoho-payments.ts
// ─── Zoho Payments SDK wrapper ───────────────────────────────────────────────

import { AppConfig } from '../../../core/config';
import { fetchOrderById } from '../../orders/services/order.api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ZohoPaymentResult {
  status: 'success' | 'failed' | 'cancelled';
  paymentId?: string;
  orderId?: string;
  errorMessage?: string;
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
 * Poll the backend for payment confirmation (webhook may take a few seconds).
 *
 * @param orderId     — order to poll
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
      const order = await fetchOrderById(orderId);

      if (order.paymentStatus === 'paid') return 'paid';
      if (order.paymentStatus === 'failed') return 'failed';
    } catch {
      // network blip — keep trying
    }

    // Wait before next attempt
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return 'pending'; // webhook hasn't fired yet
}
