// src/features/checkout/hooks/useOrder.ts
import { useCallback } from "react";
import {
  clearTempData,
  placeOrder,
  placeOrderAsync,
  resetOrder,
  selectCurrentOrder,
  selectOrderStatus,
  selectOrderError,
  selectPaymentSessionId,
  selectTempAddress,
  selectTempAddressId,
  selectTempPayment,
  setTempAddress,
  setTempAddressId,
  setTempPayment,
} from "../store/orderSlice";
import type { OrderAddress, OrderPayment } from "../types/order.types";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";

export function useOrder() {
  const dispatch = useAppDispatch();

  const tempAddress = useAppSelector(selectTempAddress);
  const tempAddressId = useAppSelector(selectTempAddressId);
  const tempPayment = useAppSelector(selectTempPayment);
  const currentOrder = useAppSelector(selectCurrentOrder);
  const status = useAppSelector(selectOrderStatus);
  const error = useAppSelector(selectOrderError);
  const paymentSessionId = useAppSelector(selectPaymentSessionId);

  const updateAddress = useCallback(
    (address: Partial<OrderAddress>) => {
      dispatch(setTempAddress(address));
    },
    [dispatch]
  );

  const updateAddressId = useCallback(
    (id: string) => {
      dispatch(setTempAddressId(id));
    },
    [dispatch]
  );

  const updatePayment = useCallback(
    (payment: Partial<OrderPayment>) => {
      dispatch(setTempPayment(payment));
    },
    [dispatch]
  );

  const clearTemp = useCallback(() => {
    dispatch(clearTempData());
  }, [dispatch]);

  /** Place order via backend API — sends addressId.
   *  Accepts an optional override to avoid stale-closure / useEffect race. */
  const submitOrderAsync = useCallback(async (overrideAddressId?: string) => {
    const id = overrideAddressId || tempAddressId;
    if (!id) throw new Error("Address ID is required");
    return dispatch(placeOrderAsync(id)).unwrap();
  }, [dispatch, tempAddressId]);

  /** Legacy local order placement */
  const submitOrder = useCallback(
    (subtotal: number, itemsCount: number) => {
      dispatch(placeOrder({ subtotal, itemsCount }));
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch(resetOrder());
  }, [dispatch]);

  const isReadyToPlace = !!(tempAddressId && tempAddress);

  return {
    tempAddress,
    tempAddressId,
    tempPayment,
    currentOrder,
    status,
    error,
    paymentSessionId,
    updateAddress,
    updateAddressId,
    updatePayment,
    clearTemp,
    submitOrder,
    submitOrderAsync,
    reset,
    isReadyToPlace,
  };
}
