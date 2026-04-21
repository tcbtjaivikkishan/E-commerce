// src/shared/services/token.service.ts
// ─── Secure token storage using expo-secure-store ────────────────────────────
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEYS = {
  ACCESS_TOKEN: "tcbt_access_token",
  REFRESH_TOKEN: "tcbt_refresh_token",
  SESSION_ID: "tcbt_session_id",
  DEVICE_ID: "tcbt_device_id",
  GUEST_SESSION_ID: "tcbt_guest_session_id",
  USER_DATA: "tcbt_user_data",
} as const;

/**
 * For web, fall back to localStorage since SecureStore isn't available.
 */
const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// ─── Access Token ────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

export async function setAccessToken(token: string): Promise<void> {
  return setItem(KEYS.ACCESS_TOKEN, token);
}

export async function clearAccessToken(): Promise<void> {
  return deleteItem(KEYS.ACCESS_TOKEN);
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function setRefreshToken(token: string): Promise<void> {
  return setItem(KEYS.REFRESH_TOKEN, token);
}

export async function clearRefreshToken(): Promise<void> {
  return deleteItem(KEYS.REFRESH_TOKEN);
}

// ─── Session ID ──────────────────────────────────────────────────────────────

export async function getSessionId(): Promise<string | null> {
  return getItem(KEYS.SESSION_ID);
}

export async function setSessionId(id: string): Promise<void> {
  return setItem(KEYS.SESSION_ID, id);
}

export async function clearSessionId(): Promise<void> {
  return deleteItem(KEYS.SESSION_ID);
}

// ─── Device ID ───────────────────────────────────────────────────────────────

export async function getDeviceId(): Promise<string> {
  let id = await getItem(KEYS.DEVICE_ID);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await setItem(KEYS.DEVICE_ID, id);
  }
  return id;
}

// ─── Guest Session ID ────────────────────────────────────────────────────────

export async function getGuestSessionId(): Promise<string | null> {
  return getItem(KEYS.GUEST_SESSION_ID);
}

export async function setGuestSessionId(id: string): Promise<void> {
  return setItem(KEYS.GUEST_SESSION_ID, id);
}

export async function clearGuestSessionId(): Promise<void> {
  return deleteItem(KEYS.GUEST_SESSION_ID);
}

// ─── User Data ───────────────────────────────────────────────────────────────

export async function getUserData(): Promise<any | null> {
  const raw = await getItem(KEYS.USER_DATA);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setUserData(user: any): Promise<void> {
  return setItem(KEYS.USER_DATA, JSON.stringify(user));
}

export async function clearUserData(): Promise<void> {
  return deleteItem(KEYS.USER_DATA);
}

// ─── Store all session tokens at once (after login / refresh) ────────────────

export async function storeSession(data: {
  access_token: string;
  refresh_token: string;
  session_id: string;
  user?: any;
}): Promise<void> {
  await Promise.all([
    setAccessToken(data.access_token),
    setRefreshToken(data.refresh_token),
    setSessionId(data.session_id),
    ...(data.user ? [setUserData(data.user)] : []),
  ]);
}

// ─── Clear all session data (logout) ─────────────────────────────────────────

export async function clearAllSession(): Promise<void> {
  await Promise.all([
    clearAccessToken(),
    clearRefreshToken(),
    clearSessionId(),
    clearUserData(),
  ]);
}
