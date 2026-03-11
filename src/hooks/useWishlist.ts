// src/hooks/useWishlist.ts
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook for wishlist state management.
// Uses React state for now. In production, swap useState with
// Zustand/Redux + AsyncStorage for persistence across sessions.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from "react";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggle = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.has(productId),
    [wishlist]
  );

  return { wishlist, toggle, isWishlisted, count: wishlist.size };
}
