// src/store/cartSlice.ts
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PRODUCTS } from "../constants/data";
import type { RootState } from "./store";

// ─── State shape ─────────────────────────────────────────────────────────────

type CartState = {
  // productId → quantity
  items: Record<string, number>;
};

const initialState: CartState = {
  items: {},
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.items[id] = (state.items[id] ?? 0) + 1;
    },
    removeItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      const qty = (state.items[id] ?? 0) - 1;
      if (qty <= 0) {
        delete state.items[id];
      } else {
        state.items[id] = qty;
      }
    },
    clearItem(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    clearCart(state) {
      state.items = {};
    },
  },
});

export const { addItem, removeItem, clearItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Raw items map { productId → qty } */
export const selectCartItems = (state: RootState) => state.cart.items;

/** Total number of items across all products */
export const selectTotalItems = createSelector(
  selectCartItems,
  (items) => Object.values(items).reduce((sum, qty) => sum + qty, 0)
);

/** Full cart items with product details */
export const selectCartProducts = createSelector(
  selectCartItems,
  (items) =>
    Object.entries(items)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === id);
        if (!product) return null;
        return { product, qty };
      })
      .filter(Boolean) as { product: (typeof PRODUCTS)[0]; qty: number }[]
);

/** Subtotal (before delivery) */
export const selectSubtotal = createSelector(
  selectCartProducts,
  (items) => items.reduce((sum, item) => sum + item.product.priceRaw * item.qty, 0)
);

/** Delivery fee — free above ₹500 */
export const selectDeliveryFee = createSelector(
  selectSubtotal,
  (subtotal) => (subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0)
);

/** Grand total */
export const selectTotal = createSelector(
  selectSubtotal,
  selectDeliveryFee,
  (subtotal, fee) => subtotal + fee
);