// src/features/auth/services/auth.service.ts
// ─── Real backend auth service ──────────────────────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";
import {
  storeSession,
  clearAllSession,
  getDeviceId,
  getGuestSessionId,
  clearGuestSessionId,
  getSessionId,
} from "../../../shared/services/token.service";
import type {
  OtpResponse,
  VerifyOtpResponse,
  LogoutResponse,
} from "../types/auth.types";

/**
 * Send OTP to phone number via backend
 * POST /auth/send-otp
 */
export const sendOtp = async (
  phone: string
): Promise<OtpResponse> => {
  // Backend normalizes 10-digit to +91 prefix
  const mobile_number = phone.replace(/\D/g, "").slice(-10);

  return apiRequest<OtpResponse>("/auth/send-otp", {
    method: "POST",
    body: { mobile_number },
    skipAuth: true,
  });
};

/**
 * Verify OTP and receive session tokens
 * POST /auth/verify-otp
 */
export const verifyOtp = async (
  phone: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  const mobile_number = phone.replace(/\D/g, "").slice(-10);
  const device_id = await getDeviceId();
  const guest_session_id = await getGuestSessionId();

  const body: Record<string, string> = {
    mobile_number,
    otp,
    device_id,
  };

  // Pass guest_session_id to merge guest cart into user cart
  if (guest_session_id) {
    body.guest_session_id = guest_session_id;
  }

  const response = await apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body,
    skipAuth: true,
  });

  // Store session tokens securely
  await storeSession({
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    session_id: response.session_id,
    user: response.user,
  });

  // Clear guest session after merge
  if (guest_session_id) {
    await clearGuestSessionId();
  }

  return response;
};

/**
 * Logout — invalidate current session
 * POST /auth/logout
 */
export const logoutUser = async (): Promise<void> => {
  try {
    const session_id = await getSessionId();
    if (session_id) {
      await apiRequest<LogoutResponse>("/auth/logout", {
        method: "POST",
        body: { session_id },
      });
    }
  } catch {
    // Even if API call fails, clear local session
  }
  await clearAllSession();
};
