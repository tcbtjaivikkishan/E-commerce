// src/store/store.ts
// ─── Root Redux store — all feature slices wired ────────────────────────────
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/store/cartSlice";
import orderReducer from "../features/checkout/store/orderSlice";
import userReducer from "../features/auth/store/userSlice";
import wishlistReducer from "../features/catalog/store/wishlistSlice";
import ordersReducer from "../features/orders/store/ordersSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;