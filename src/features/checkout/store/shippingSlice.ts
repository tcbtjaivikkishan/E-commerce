// src/features/checkout/store/shippingSlice.ts
// ─── Redux slice for background shipping rate calculation ────────────────────
// Shipping rates are fetched in the background whenever the cart changes,
// so the rate is already available when the user opens the Cart screen.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchCart } from "../../cart/services/cart.api";
import { calculateShippingRate, type ShippingRateResponse } from "../services/shipping.api";
import type { RootState } from "../../../store/store";

// ─── State ───────────────────────────────────────────────────────────────────

type ShippingStatus = "idle" | "loading" | "success" | "error";

interface ShippingState {
  status: ShippingStatus;
  data: ShippingRateResponse | null;
  errorMessage: string | null;
  lastPincode: number | null;
}

const initialState: ShippingState = {
  status: "idle",
  data: null,
  errorMessage: null,
  lastPincode: null,
};

// ─── Async Thunk ─────────────────────────────────────────────────────────────

interface CalcShippingArgs {
  pincode: number;
  /** If provided, skip the fetchCart() call and use this weight directly */
  totalWeight?: number;
}

export const calcShippingInBackground = createAsyncThunk<
  ShippingRateResponse,
  CalcShippingArgs,
  { rejectValue: string }
>(
  "shipping/calcRate",
  async ({ pincode, totalWeight: providedWeight }, { rejectWithValue }) => {
    try {
      // Use provided weight or fetch from backend
      let totalWeight = providedWeight ?? 0;

      if (!totalWeight) {
        const cartData = await fetchCart();
        totalWeight = cartData.totalWeight || 0;
      }

      console.log("[SHIPPING BG] weight:", totalWeight, "g, pincode:", pincode);

      if (totalWeight === 0) {
        return rejectWithValue("Cart is empty or has no weight data");
      }

      const result = await calculateShippingRate(totalWeight, pincode);
      console.log("[SHIPPING BG] Rate:", result.shippingCharge, result.courier);
      return result;
    } catch (err: any) {
      console.error("[SHIPPING BG] Error:", err?.message);
      return rejectWithValue(err?.message || "Failed to calculate shipping");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    resetShipping(state) {
      state.status = "idle";
      state.data = null;
      state.errorMessage = null;
      state.lastPincode = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(calcShippingInBackground.pending, (state, action) => {
      state.status = "loading";
      state.errorMessage = null;
      state.lastPincode = action.meta.arg.pincode;
    });
    builder.addCase(calcShippingInBackground.fulfilled, (state, action) => {
      state.status = "success";
      state.data = action.payload;
      state.errorMessage = null;
    });
    builder.addCase(calcShippingInBackground.rejected, (state, action) => {
      state.status = "error";
      state.errorMessage = (action.payload as string) || "Unknown error";
    });
  },
});

export const { resetShipping } = shippingSlice.actions;
export default shippingSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectShippingStatus = (s: RootState) => s.shipping.status;
export const selectShippingData = (s: RootState) => s.shipping.data;
export const selectShippingError = (s: RootState) => s.shipping.errorMessage;
export const selectShippingCharge = (s: RootState) =>
  s.shipping.status === "success" && s.shipping.data
    ? s.shipping.data.shippingCharge
    : 0;

// ─── Debounced dispatcher ────────────────────────────────────────────────────
// Call this after every cart mutation. Passes totalWeight from the PATCH
// response so we DON'T need an extra fetchCart() call.

let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Dispatch a shipping rate calculation after a short debounce.
 * Accepts totalWeight from the cart API response to skip redundant fetchCart().
 */
export function dispatchShippingCalc(
  dispatch: any,
  getState: () => RootState,
  totalWeight?: number,
) {
  if (_debounceTimer) clearTimeout(_debounceTimer);

  _debounceTimer = setTimeout(() => {
    const state = getState();
    const addresses = state.user.addresses || [];
    const selectedAddress = addresses[0];
    const pincode = Number(selectedAddress?.pincode);

    if (!pincode || Object.keys(state.cart.items).length === 0) {
      return;
    }

    dispatch(calcShippingInBackground({ pincode, totalWeight }));
  }, 400); // 400ms debounce — fast enough for UX, still batches rapid taps
}
