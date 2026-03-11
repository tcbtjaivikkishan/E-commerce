// src/hooks/useCart.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cart state. qty map: { productId → quantity }
// In production: persist to AsyncStorage and sync with backend on checkout.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from "react";

type CartMap = Record<string, number>;

export function useCart() {
  const [cart, setCart] = useState<CartMap>({});

  const add = useCallback((productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }, []);

  const remove = useCallback((productId: string) => {
    setCart((prev) => {
      const qty = (prev[productId] ?? 0) - 1;
      if (qty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: qty };
    });
  }, []);

  const getQty = useCallback(
    (productId: string) => cart[productId] ?? 0,
    [cart]
  );

  const totalItems = Object.values(cart).reduce((s, v) => s + v, 0);

  return { cart, add, remove, getQty, totalItems };
}
