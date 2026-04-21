// src/features/auth/types/auth.types.ts
// ─── Auth domain types — matches backend response shapes ────────────────────

export interface UserState {
  isLoggedIn: boolean;
  userId: string | null;
  phone: string | null;
  name: string | null;
  email: string | null;
  token: string | null;
  sessionId: string | null;
  addresses: UserAddress[];
}

export interface UserAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  receiver_name?: string;
  receiver_phone?: string;
  _id?: string;
}

export interface LoginPayload {
  phone: string;
  isLoggedIn: boolean;
  token?: string;
  name?: string;
  email?: string;
  userId?: string;
  sessionId?: string;
  addresses?: UserAddress[];
}

export interface OtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  refresh_token: string;
  session_id: string;
  user: BackendUser;
}

export interface BackendUser {
  _id: string;
  mobile_number: string;
  name?: string;
  email?: string;
  addresses?: UserAddress[];
  zoho_contact_id?: string;
  last_login_at?: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  session_id: string;
}

export interface LogoutResponse {
  message: string;
}
