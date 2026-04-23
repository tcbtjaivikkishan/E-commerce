// src/features/auth/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserState, LoginPayload, UserAddress } from "../types/auth.types";

const initialState: UserState = {
  isLoggedIn: false,
  userId: null,
  phone: null,
  name: null,
  email: null,
  token: null,
  sessionId: null,
  addresses: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<LoginPayload>) {
      state.isLoggedIn = true;
      state.phone = action.payload.phone;
      state.token = action.payload.token ?? null;
      state.name = action.payload.name ?? null;
      state.email = action.payload.email ?? null;
      state.userId = action.payload.userId ?? null;
      state.sessionId = action.payload.sessionId ?? null;
      state.addresses = action.payload.addresses ?? [];
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userId = null;
      state.phone = null;
      state.token = null;
      state.name = null;
      state.email = null;
      state.sessionId = null;
      state.addresses = [];
    },
    updateProfile(
      state,
      action: PayloadAction<{ name?: string; email?: string }>
    ) {
      if (action.payload.name !== undefined) state.name = action.payload.name;
      if (action.payload.email !== undefined) state.email = action.payload.email;
    },
    setAddresses(state, action: PayloadAction<UserAddress[]>) {
      state.addresses = action.payload;
    },
    addAddress(state, action: PayloadAction<UserAddress>) {
      state.addresses.push(action.payload);
    },
    removeAddress(state, action: PayloadAction<number>) {
      state.addresses.splice(action.payload, 1);
    },
    updateAddress(
      state,
      action: PayloadAction<{ index: number; address: UserAddress }>
    ) {
      state.addresses[action.payload.index] = action.payload.address;
    },
  },
});

export const {
  loginSuccess,
  logout,
  updateProfile,
  setAddresses,
  addAddress,
  removeAddress,
  updateAddress,
} = userSlice.actions;
export default userSlice.reducer;
