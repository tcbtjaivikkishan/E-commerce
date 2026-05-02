// src/features/catalog/store/wishlistSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";
import { RESET_APP } from "../../../store/resetAction";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "../services/wishlist.api";

interface WishlistState {
  items: WishlistItem[];
  itemIds: string[]; // zoho_item_ids for quick lookup
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  itemIds: [],
  loading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loadWishlist = createAsyncThunk(
  "wishlist/load",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchWishlist();
      return data.items || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load wishlist");
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (zoho_item_id: string, { rejectWithValue }) => {
    try {
      const data = await addToWishlist(zoho_item_id);
      return data.items || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to add to wishlist");
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (zoho_item_id: string, { rejectWithValue }) => {
    try {
      const data = await removeFromWishlist(zoho_item_id);
      return data.items || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to remove from wishlist");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist(state) {
      state.items = [];
      state.itemIds = [];
    },
  },
  extraReducers: (builder) => {
    const handleFulfilled = (
      state: WishlistState,
      items: WishlistItem[]
    ) => {
      state.items = items;
      state.itemIds = items.map((i) => i.zoho_item_id);
      state.loading = false;
      state.error = null;
    };

    builder
      .addCase(loadWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWishlist.fulfilled, (state, action) => {
        handleFulfilled(state, action.payload);
      })
      .addCase(loadWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        handleFulfilled(state, action.payload);
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        handleFulfilled(state, action.payload);
      })

      // ── Global reset on logout ──
      .addCase(RESET_APP, () => initialState);
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistIds = (state: RootState) => state.wishlist.itemIds;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;
export const selectIsWishlisted = (state: RootState, zohoItemId: string) =>
  state.wishlist.itemIds.includes(zohoItemId);
