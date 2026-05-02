// src/features/checkout/store/orderSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { OrderAddress, OrderPayment, OrderSummary } from "../types/order.types";
import type { RootState } from "../../../store/store";
import { RESET_APP } from "../../../store/resetAction";
import { createOrder } from "../../orders/services/order.api";

// ─── State ───
interface OrderState {
  tempAddress: Partial<OrderAddress> | null;
  tempAddressId: string | null;
  tempPayment: Partial<OrderPayment> | null;
  currentOrder: OrderSummary | null;
  status: "idle" | "filling" | "placing" | "success" | "error";
  error: string | null;
  paymentSessionId: string | null;
}

const initialState: OrderState = {
  tempAddress: null,
  tempAddressId: null,
  tempPayment: null,
  currentOrder: null,
  status: "idle",
  error: null,
  paymentSessionId: null,
};

// ─── Async Thunks ───
export const placeOrderAsync = createAsyncThunk(
  "order/placeAsync",
  async (
    { addressId, couponId }: { addressId: string; couponId?: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('[ORDER THUNK] Calling createOrder with addressId:', addressId, 'couponId:', couponId);
      const response = await createOrder(addressId, couponId);
      console.log('[ORDER THUNK] createOrder response:', JSON.stringify(response));
      return response;
    } catch (err: any) {
      console.error('[ORDER THUNK] createOrder failed:', err);
      console.error('[ORDER THUNK] Error message:', err?.message);
      return rejectWithValue(err.message || "Failed to place order");
    }
  }
);

// ─── Slice ───
export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setTempAddress: (state, action: PayloadAction<Partial<OrderAddress>>) => {
      state.tempAddress = { ...state.tempAddress, ...action.payload };
    },
    setTempAddressId: (state, action: PayloadAction<string>) => {
      state.tempAddressId = action.payload;
    },
    setTempPayment: (state, action: PayloadAction<Partial<OrderPayment>>) => {
      state.tempPayment = { ...state.tempPayment, ...action.payload };
    },
    clearTempData(state) {
      state.tempAddress = null;
      state.tempAddressId = null;
      state.tempPayment = null;
    },
    // Keep local placeOrder for offline/fallback
    placeOrder: (
      state,
      action: PayloadAction<{ subtotal: number; itemsCount: number }>
    ) => {
      if (!state.tempAddress || !state.tempPayment) return;

      state.currentOrder = {
        id: `ORD-local-${Date.now()}`,
        total: action.payload.subtotal,
        itemsCount: action.payload.itemsCount,
        timestamp: new Date().toISOString(),
        status: "placed",
        address: state.tempAddress as OrderAddress,
      };
      state.status = "success";
      state.tempAddress = null;
      state.tempPayment = null;
    },
    resetOrder: (state) => {
      state.currentOrder = null;
      state.status = "idle";
      state.error = null;
      state.paymentSessionId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrderAsync.pending, (state) => {
        state.status = "placing";
        state.error = null;
      })
      .addCase(placeOrderAsync.fulfilled, (state, action) => {
        state.currentOrder = {
          id: action.payload.orderId,
          total: 0, // Will be filled from order detail
          itemsCount: 0,
          timestamp: new Date().toISOString(),
          status: "placed",
          address: state.tempAddress as OrderAddress,
        };
        state.paymentSessionId = action.payload.paymentSessionId;
        state.status = "success";
        state.tempAddress = null;
        state.tempPayment = null;
      })
      .addCase(placeOrderAsync.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })

      // ── Global reset on logout ──
      .addCase(RESET_APP, () => initialState);
  },
});

export const {
  setTempAddress,
  setTempAddressId,
  setTempPayment,
  clearTempData,
  placeOrder,
  resetOrder,
} = orderSlice.actions;

export default orderSlice.reducer;

// ─── Selectors ───
export const selectTempAddress = (state: RootState) => state.order?.tempAddress;
export const selectTempAddressId = (state: RootState) => state.order?.tempAddressId;
export const selectTempPayment = (state: RootState) => state.order?.tempPayment;
export const selectCurrentOrder = (state: RootState) =>
  state.order?.currentOrder;
export const selectOrderStatus = (state: RootState) => state.order?.status;
export const selectOrderError = (state: RootState) => state.order?.error;
export const selectPaymentSessionId = (state: RootState) =>
  state.order?.paymentSessionId;
