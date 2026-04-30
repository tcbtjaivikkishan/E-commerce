// src/features/auth/hooks/useOtpAutoRead.ts
// ─── Auto-read OTP from SMS on Android using SMS Retriever API ───────────────
// On iOS, we rely on textContentType="oneTimeCode" on the TextInput instead.

import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";

// Conditionally import the native module — it's Android-only.
// On iOS (or web) these will be no-ops.
let OtpVerify: typeof import("react-native-otp-verify") | null = null;

if (Platform.OS === "android") {
  try {
    OtpVerify = require("react-native-otp-verify");
  } catch {
    // Library not available — graceful fallback
    console.warn("[useOtpAutoRead] react-native-otp-verify not available");
  }
}

const OTP_REGEX = /(\d{6})/; // Matches the first 6-digit sequence

interface UseOtpAutoReadOptions {
  /** Whether the listener should be active (e.g. step === "otp") */
  enabled: boolean;
  /** Called when an OTP is successfully extracted from SMS */
  onOtpReceived: (otp: string) => void;
}

/**
 * Hook that listens for incoming OTP SMS on Android via the SMS Retriever API.
 *
 * - **No SMS permissions required** (uses Google Play Services SMS Retriever).
 * - Works only on Android. On iOS, this is a no-op; rely on `textContentType="oneTimeCode"`.
 * - The SMS **must** end with your 11-character app hash for auto-detection to work.
 *
 * @example
 * ```tsx
 * useOtpAutoRead({
 *   enabled: step === "otp",
 *   onOtpReceived: (code) => {
 *     setOtp(code);
 *     handleVerify(code);
 *   },
 * });
 * ```
 */
export function useOtpAutoRead({ enabled, onOtpReceived }: UseOtpAutoReadOptions) {
  const receivedRef = useRef(false);

  // Stable callback ref so we don't re-register listeners on every render
  const onOtpRef = useRef(onOtpReceived);
  onOtpRef.current = onOtpReceived;

  const getAppHash = useCallback(async (): Promise<string | null> => {
    if (Platform.OS !== "android" || !OtpVerify) return null;
    try {
      const hashes = await OtpVerify.getHash();
      return hashes?.[0] ?? null;
    } catch (err) {
      console.warn("[useOtpAutoRead] Failed to get app hash:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || Platform.OS !== "android" || !OtpVerify) return;

    receivedRef.current = false;

    // Start the SMS Retriever listener
    OtpVerify.startOtpListener((message: string) => {
      if (receivedRef.current) return; // prevent duplicate processing

      const match = OTP_REGEX.exec(message);
      if (match?.[1]) {
        receivedRef.current = true;
        onOtpRef.current(match[1]);
      }
    });

    // Cleanup on unmount or when disabled
    return () => {
      OtpVerify?.removeListener();
    };
  }, [enabled]);

  return { getAppHash };
}
