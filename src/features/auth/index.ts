// src/features/auth/index.ts
export { default as LoginScreen } from "./screens/LoginScreen";
export { default as SignupScreen } from "./screens/SignupScreen";
export { loginSuccess, logout, updateProfile, setAddresses, addAddress } from "./store/userSlice";
export { sendOtp, verifyOtp, logoutUser } from "./services/auth.service";
export type { UserState, LoginPayload, OtpResponse, VerifyOtpResponse, BackendUser, UserAddress } from "./types/auth.types";
