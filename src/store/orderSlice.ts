import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid
import type { OrderAddress, OrderPayment, OrderSummary } from '../types/order';
import type { RootState } from './store';

// ─── State ───
interface OrderState {
  tempAddress: Partial<OrderAddress> | null;
  tempPayment: Partial<OrderPayment> | null;
  currentOrder: OrderSummary | null;
  status: 'idle' | 'filling' | 'placing' | 'success';
}

const initialState: OrderState = {
  tempAddress: null,
  tempPayment: null,
  currentOrder: null,
  status: 'idle',
};

// ─── Slice ───
export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setTempAddress: (state, action: PayloadAction<Partial<OrderAddress>>) => {
      state.tempAddress = { ...state.tempAddress, ...action.payload };
    },
    setTempPayment: (state, action: PayloadAction<Partial<OrderPayment>>) => {
      state.tempPayment = { ...state.tempPayment, ...action.payload };
    },
    clearTempData(state) {
      state.tempAddress = null;
      state.tempPayment = null;
    },
    placeOrder: (state, action: PayloadAction<{ subtotal: number; itemsCount: number }>) => {
      if (!state.tempAddress || !state.tempPayment) return;
      
      const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
      state.currentOrder = {
        id: orderId,
        total: action.payload.subtotal,
        itemsCount: action.payload.itemsCount,
        timestamp: new Date().toISOString(),
        status: 'placed',
        address: state.tempAddress as OrderAddress,
      };
      state.status = 'success';
      state.tempAddress = null;
      state.tempPayment = null;
    },
    resetOrder: (state) => {
      state.currentOrder = null;
      state.status = 'idle';
    },
  },
});

export const { 
  setTempAddress, 
  setTempPayment, 
  clearTempData,
  placeOrder, 
  resetOrder 
} = orderSlice.actions;

export default orderSlice.reducer;

// ─── Selectors ───
export const selectTempAddress = (state: RootState) => state.order?.tempAddress;
export const selectTempPayment = (state: RootState) => state.order?.tempPayment;
export const selectCurrentOrder = (state: RootState) => state.order?.currentOrder;
export const selectOrderStatus = (state: RootState) => state.order?.status;

