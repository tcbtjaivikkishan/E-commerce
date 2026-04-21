// src/features/catalog/hooks/useWishlist.ts
// ─────────────────────────────────────────────────────────────────────────────
// Wishlist hook — backed by Redux + API for authenticated users.
// Falls back to local state for guests.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import {
  loadWishlist,
  addWishlistItem,
  removeWishlistItem,
  selectWishlistIds,
  selectWishlistLoading,
} from "../store/wishlistSlice";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const serverIds = useAppSelector(selectWishlistIds);
  const loading = useAppSelector(selectWishlistLoading);

  // Local wishlist for guests
  const [localWishlist, setLocalWishlist] = useState<Set<string>>(new Set());

  // Load wishlist from server on login
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(loadWishlist());
    }
  }, [dispatch, isLoggedIn]);

  const toggle = useCallback(
    (productId: string) => {
      if (isLoggedIn) {
        if (serverIds.includes(productId)) {
          dispatch(removeWishlistItem(productId));
        } else {
          dispatch(addWishlistItem(productId));
        }
      } else {
        setLocalWishlist((prev) => {
          const next = new Set(prev);
          if (next.has(productId)) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });
      }
    },
    [dispatch, isLoggedIn, serverIds]
  );

  const isWishlisted = useCallback(
    (productId: string) => {
      if (isLoggedIn) {
        return serverIds.includes(productId);
      }
      return localWishlist.has(productId);
    },
    [isLoggedIn, serverIds, localWishlist]
  );

  const count = isLoggedIn ? serverIds.length : localWishlist.size;

  return { toggle, isWishlisted, count, loading };
}
