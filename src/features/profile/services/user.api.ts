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
 * Backend returns the updated addresses array directly.
 */
export async function addUserAddress(
  userId: string,
  address: Partial<UserAddress>
): Promise<UserAddress[]> {
  return apiRequest<UserAddress[]>(`/users/${userId}/address`, {
    method: "PATCH",
    body: address,
  });
}

/**
 * DELETE /users/:id/address/:addressId — delete an address [JWT]
 * Backend returns the updated addresses array directly.
 */
export async function deleteUserAddress(
  userId: string,
  addressId: string
): Promise<UserAddress[]> {
  return apiRequest<UserAddress[]>(`/users/${userId}/address/${addressId}`, {
    method: "DELETE",
  });
}

/**
 * PATCH /users/:id/address/:addressId — update a specific address [JWT]
 */
export async function updateUserAddress(
  userId: string,
  addressId: string,
  address: Partial<UserAddress>
): Promise<UserAddress> {
  return apiRequest<UserAddress>(`/users/${userId}/address/${addressId}`, {
    method: "PATCH",
    body: address,
  });
}
