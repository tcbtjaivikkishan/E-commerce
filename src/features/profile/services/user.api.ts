// src/features/profile/services/user.api.ts
// ─── Real API calls for user profile ─────────────────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";
import type { BackendUser, UserAddress } from "../../auth/types/auth.types";

/**
 * GET /users/:id — get user profile [JWT]
 */
export async function fetchUserProfile(userId: string): Promise<BackendUser> {
  return apiRequest<BackendUser>(`/users/${userId}`);
}

/**
 * PATCH /users/:id — update name, email, etc [JWT]
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<BackendUser> {
  return apiRequest<BackendUser>(`/users/${userId}`, {
    method: "PATCH",
    body: data,
  });
}

/**
 * PATCH /users/:id/address — add a new address [JWT]
 */
export async function addUserAddress(
  userId: string,
  address: Partial<UserAddress>
): Promise<BackendUser> {
  return apiRequest<BackendUser>(`/users/${userId}/address`, {
    method: "PATCH",
    body: address,
  });
}
