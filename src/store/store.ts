// src/store/store.ts
// ─── Root Redux store — all feature slices wired ────────────────────────────
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/auth/store/userSlice";
import cartReducer from "../features/cart/store/cartSlice";
import wishlistReducer from "../features/catalog/store/wishlistSlice";
import orderReducer from "../features/checkout/store/orderSlice";
import shippingReducer from "../features/checkout/store/shippingSlice";
import ordersReducer from "../features/orders/store/ordersSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
    shipping: shippingReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;