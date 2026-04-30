// src/shared/services/api.client.ts
// ─── HTTP client with JWT auth, token refresh, and error handling ────────────
import { AppConfig } from "../../core/config";
import {
  getAccessToken,
  getRefreshToken,
  getSessionId,
  storeSession,
  clearAllSession,
} from "./token.service";

const BASE_URL = AppConfig.API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** If true, skip attaching the Authorization header */
  skipAuth?: boolean;
}

/** Flag to prevent concurrent refresh attempts */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns true if refresh succeeded.
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const session_id = await getSessionId();
    const refresh_token = await getRefreshToken();

    if (!session_id || !refresh_token) return false;

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ session_id, refresh_token }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    await storeSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      session_id: data.session_id,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Core API request function with automatic auth & token refresh.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  // Build headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    // ngrok requires this header to skip the browser warning page
    "ngrok-skip-browser-warning": "true",
    ...headers,
  };

  // Attach JWT if available and not skipped
  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${BASE_URL}${endpoint}`;
  if (__DEV__) console.log(`[API] ${method} ${url}`, body ? JSON.stringify(body) : '');

  let response = await fetch(url, {
    method,
    headers: requestHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // If 401/403 and we have a refresh token, try refreshing
  if ((response.status === 401 || response.status === 403) && !skipAuth) {
    // Deduplicate concurrent refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await (refreshPromise ?? Promise.resolve(false));

    if (refreshed) {
      // Retry original request with new token
      const newToken = await getAccessToken();
      if (newToken) {
        requestHeaders["Authorization"] = `Bearer ${newToken}`;
      }
      response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } else {
      // Refresh failed — clear session
      await clearAllSession();
      throw new ApiError(401, "Session expired. Please log in again.");
    }
  }

  // Parse response
  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (__DEV__) console.log(`[API] ${method} ${endpoint} → ${response.status}`, JSON.stringify(data).substring(0, 500));

  if (!response.ok) {
    if (__DEV__) console.error(`[API] ERROR ${response.status}:`, JSON.stringify(data));
    throw new ApiError(
      response.status,
      data?.message || data?.error || `API Error: ${response.status}`,
      data
    );
  }

  return data as T;
}

/**
 * Custom error class for API responses.
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
