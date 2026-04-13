import { useCallback } from 'react';
import {
  clearTempData,
  placeOrder,
  resetOrder,
  selectCurrentOrder,
  selectOrderStatus,
  selectTempAddress,
  selectTempPayment,
  setTempAddress,
  setTempPayment,
} from '../store/orderSlice';
import type { OrderAddress, OrderPayment } from '../types/order';
import { useAppDispatch, useAppSelector } from './redux';

export function useOrder() {
  const dispatch = useAppDispatch();

  const tempAddress = useAppSelector(selectTempAddress);
  const tempPayment = useAppSelector(selectTempPayment);
  const currentOrder = useAppSelector(selectCurrentOrder);
  const status = useAppSelector(selectOrderStatus);

  const updateAddress = useCallback((address: Partial<OrderAddress>) => {
    dispatch(setTempAddress(address));
  }, [dispatch]);

  const updatePayment = useCallback((payment: Partial<OrderPayment>) => {
    dispatch(setTempPayment(payment));
  }, [dispatch]);

  const clearTemp = useCallback(() => {
    dispatch(clearTempData());
  }, [dispatch]);

  const submitOrder = useCallback((subtotal: number, itemsCount: number) => {
    dispatch(placeOrder({ subtotal, itemsCount }));
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetOrder());
  }, [dispatch]);

  const isReadyToPlace = !!(tempAddress && Object.keys(tempAddress).length === 6 && tempPayment?.method);

  return {
    tempAddress,
    tempPayment,
    currentOrder,
    status,
    updateAddress,
    updatePayment,
    clearTemp,
    submitOrder,
    reset,
    isReadyToPlace,
  };
}

