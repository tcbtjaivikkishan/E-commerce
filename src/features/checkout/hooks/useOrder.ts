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
  selectTempPayment,
  setTempAddress,
  setTempPayment,
} from "../store/orderSlice";
import type { OrderAddress, OrderPayment } from "../types/order.types";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";

export function useOrder() {
  const dispatch = useAppDispatch();

  const tempAddress = useAppSelector(selectTempAddress);
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

  const updatePayment = useCallback(
    (payment: Partial<OrderPayment>) => {
      dispatch(setTempPayment(payment));
    },
    [dispatch]
  );

  const clearTemp = useCallback(() => {
    dispatch(clearTempData());
  }, [dispatch]);

  /** Place order via backend API */
  const submitOrderAsync = useCallback(async () => {
    if (!tempAddress) throw new Error("Address is required");
    return dispatch(placeOrderAsync(tempAddress as OrderAddress)).unwrap();
  }, [dispatch, tempAddress]);

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

  const isReadyToPlace = !!(
    tempAddress &&
    Object.keys(tempAddress).length === 6 &&
    tempPayment?.method
  );

  return {
    tempAddress,
    tempPayment,
    currentOrder,
    status,
    error,
    paymentSessionId,
    updateAddress,
    updatePayment,
    clearTemp,
    submitOrder,
    submitOrderAsync,
    reset,
    isReadyToPlace,
  };
}
