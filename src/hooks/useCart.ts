// src/hooks/useCart.ts
// Thin hook wrapping Redux dispatch + selectors.
// NOTE: getQty reads from the already-selected `cart` snapshot — it is NOT
// a hook and never calls useSelector inside, so it's safe to call in loops/callbacks.
import { useCallback } from "react";
import {
  addItem,
  clearCart,
  clearItem,
  removeItem,
  selectCartItems,
  selectCartProducts,
  selectDeliveryFee,
  selectSubtotal,
  selectTotal,
  selectTotalItems,
} from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "./redux";

export function useCart() {
  const dispatch = useAppDispatch();

  const cart        = useAppSelector(selectCartItems);
  const cartItems   = useAppSelector(selectCartProducts);
  const totalItems  = useAppSelector(selectTotalItems);
  const subtotal    = useAppSelector(selectSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total       = useAppSelector(selectTotal);

  const add      = useCallback((id: string) => dispatch(addItem(id)),    [dispatch]);
  const remove   = useCallback((id: string) => dispatch(removeItem(id)), [dispatch]);
  const clear    = useCallback((id: string) => dispatch(clearItem(id)),  [dispatch]);
  const clearAll = useCallback(()           => dispatch(clearCart()),     [dispatch]);

  // Reads from the cart snapshot already in scope — no hook inside
  const getQty = useCallback((id: string) => cart[id] ?? 0, [cart]);

  return { cart, cartItems, totalItems, subtotal, deliveryFee, total, add, remove, clearItem: clear, clearCart: clearAll, getQty };
}

// Per-product hook — more efficient in large lists (only re-renders when that product's qty changes)
export function useProductQty(productId: string) {
  const dispatch = useAppDispatch();
  const qty      = useAppSelector((state) => state.cart.items[productId] ?? 0);
  const add      = useCallback(() => dispatch(addItem(productId)),    [dispatch, productId]);
  const remove   = useCallback(() => dispatch(removeItem(productId)), [dispatch, productId]);
  return { qty, add, remove };
}