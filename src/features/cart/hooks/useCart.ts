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
      // Optimistic update
      dispatch(addItem(id));
      // Then sync with server
      const newQty = (cart[id] ?? 0) + 1;
      dispatch(updateItemAsync({ productId: id, quantity: newQty }));
    },
    [dispatch, cart]
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(removeItem(id));
      const newQty = Math.max(0, (cart[id] ?? 0) - 1);
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
    dispatch(addItem(productId));
    dispatch(updateItemAsync({ productId, quantity: qty + 1 }));
  }, [dispatch, productId, qty]);

  const remove = useCallback(() => {
    dispatch(removeItem(productId));
    dispatch(updateItemAsync({ productId, quantity: Math.max(0, qty - 1) }));
  }, [dispatch, productId, qty]);

  return { qty, add, remove };
}
