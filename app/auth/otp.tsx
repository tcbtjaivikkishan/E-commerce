// app/auth/otp.tsx
// This file exists to satisfy expo-router's file-based routing.
// The actual OTP UI is handled inside LoginScreen (step = "otp").
// Expo-router warned because this file had no default export.

import { Redirect } from "expo-router";

export default function OtpRedirect() {
  // If someone navigates directly to /auth/otp, send them to login
  return <Redirect href="/auth/login" />;
}
