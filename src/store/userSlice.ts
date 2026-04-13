// src/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  isLoggedIn: boolean;
  phone: string | null;
  name: string | null;
  token: string | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  phone: null,
  name: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ phone: string; isLoggedIn: boolean; token?: string; name?: string }>) {
      state.isLoggedIn = true;
      state.phone = action.payload.phone;
      state.token = action.payload.token ?? null;
      state.name = action.payload.name ?? null;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.phone = null;
      state.token = null;
      state.name = null;
    },
    updateProfile(state, action: PayloadAction<{ name?: string }>) {
      if (action.payload.name) state.name = action.payload.name;
    },
  },
});

export const { loginSuccess, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;
