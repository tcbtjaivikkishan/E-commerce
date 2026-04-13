// src/services/authService.ts
// 🔧 MOCK implementation — swap with real Twilio/backend calls later

const MOCK_OTP = "1234";

/**
 * Send OTP to phone number
 * Replace this with: POST /api/auth/send-otp { phone }
 */
export const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
  // MOCK: simulate network delay
  await new Promise((res) => setTimeout(res, 800));

  if (phone.length !== 10) {
    throw new Error("Invalid phone number");
  }

  console.log(`[MOCK] OTP sent to +91${phone}: ${MOCK_OTP}`);
  return { success: true, message: "OTP sent successfully" };
};

/**
 * Verify OTP
 * Replace this with: POST /api/auth/verify-otp { phone, otp }
 * Should return a JWT token from your backend
 */
export const verifyOtp = async (
  phone: string,
  otp: string
): Promise<{ success: boolean; token: string; name?: string }> => {
  await new Promise((res) => setTimeout(res, 800));

  if (otp !== MOCK_OTP) {
    throw new Error("Invalid OTP");
  }

  // MOCK token — your real backend will return a JWT
  return {
    success: true,
    token: `mock_token_${phone}_${Date.now()}`,
  };
};
