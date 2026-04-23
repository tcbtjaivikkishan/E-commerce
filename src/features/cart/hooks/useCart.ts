// src/features/cart/hooks/useCart.ts
import { useCallback, useEffect } from "react";
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
  selectCartLoading,
  syncCart,
  updateItemAsync,
} from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";

export function useCart() {
  const dispatch = useAppDispatch();

  const cart        = useAppSelector(selectCartItems);
  const cartItems   = useAppSelector(selectCartProducts);
  const totalItems  = useAppSelector(selectTotalItems);
  const subtotal    = useAppSelector(selectSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total       = useAppSelector(selectTotal);
  const loading     = useAppSelector(selectCartLoading);

  // Sync cart from server on mount
  useEffect(() => {
    dispatch(syncCart());
  }, [dispatch]);

  const add = useCallback(
    (id: string) => {
      // Read current qty BEFORE dispatching the optimistic update
      const currentQty = cart[id] ?? 0;
      const newQty = currentQty + 1;
      dispatch(addItem(id));
      dispatch(updateItemAsync({ productId: id, quantity: newQty }));
    },
    [dispatch, cart]
  );

  const remove = useCallback(
    (id: string) => {
      const currentQty = cart[id] ?? 0;
      const newQty = Math.max(0, currentQty - 1);
      dispatch(removeItem(id));
      dispatch(updateItemAsync({ productId: id, quantity: newQty }));
    },
    [dispatch, cart]
  );

  const clear = useCallback(
    (id: string) => {
      dispatch(clearItem(id));
      dispatch(updateItemAsync({ productId: id, quantity: 0 }));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => dispatch(clearCart()), [dispatch]);

  const getQty = useCallback((id: string) => cart[id] ?? 0, [cart]);

  return {
    cart,
    cartItems,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    loading,
    add,
    remove,
    clearItem: clear,
    clearCart: clearAll,
    getQty,
  };
}

export function useProductQty(productId: string) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems);
  const qty  = cart[productId] ?? 0;

  const add = useCallback(() => {
    const currentQty = cart[productId] ?? 0;
    dispatch(addItem(productId));
    dispatch(updateItemAsync({ productId, quantity: currentQty + 1 }));
  }, [dispatch, productId, cart]);

  const remove = useCallback(() => {
    const currentQty = cart[productId] ?? 0;
    dispatch(removeItem(productId));
    dispatch(updateItemAsync({ productId, quantity: Math.max(0, currentQty - 1) }));
  }, [dispatch, productId, cart]);

  return { qty, add, remove };
}
