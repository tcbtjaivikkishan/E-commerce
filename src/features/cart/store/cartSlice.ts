// src/features/cart/store/cartSlice.ts
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";
import {
  fetchCart,
  updateCartItem,
  type CartResponse
} from "../services/cart.api";

// ─── Types ───────────────────────────────────────────────────────────────────

type CartProduct = {
  id: string;
  name: string;
  priceRaw: number;
  unit: string;
  image: string;
};

type CartState = {
  /** productId → quantity (local optimistic state) */
  items: Record<string, number>;
  /** Enriched product data from API */
  productData: Record<string, CartProduct>;
  /** Server cart total */
  serverTotal: number;
  /** Loading / syncing state */
  loading: boolean;
  error: string | null;
};

const initialState: CartState = {
  items: {},
  productData: {},
  serverTotal: 0,
  loading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

/** Fetch the full cart from the server */
export const syncCart = createAsyncThunk(
  "cart/syncCart",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCart();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load cart");
    }
  }
);

/** Add/update/remove a single item via API */
export const updateItemAsync = createAsyncThunk(
  "cart/updateItem",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      return await updateCartItem(productId, quantity);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update cart");
    }
  }
);

// ─── Helper: parse API cart response into local state shape ──────────────────

function parseCartResponse(cart: CartResponse) {
  const items: Record<string, number> = {};
  const productData: Record<string, CartProduct> = {};

  for (const item of cart.items || []) {
    const id = item.product_id;
    items[id] = item.quantity;
    if (item.name) {
      productData[id] = {
        id,
        name: item.name || "Unknown",
        priceRaw: item.price || 0,
        unit: "",
        image: item.image_url || "https://via.placeholder.com/150",
      };
    }
  }

  return { items, productData, serverTotal: cart.total_amount || 0 };
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Optimistic add (increment by 1) — triggers API call separately */
    addItem(state, action: PayloadAction<string>) {
      const id = String(action.payload);
      state.items[id] = (state.items[id] ?? 0) + 1;
    },
    /** Optimistic remove (decrement by 1) */
    removeItem(state, action: PayloadAction<string>) {
      const id = String(action.payload);
      const qty = (state.items[id] ?? 0) - 1;
      if (qty <= 0) {
        delete state.items[id];
      } else {
        state.items[id] = qty;
      }
    },
    /** Remove product entirely */
    clearItem(state, action: PayloadAction<string>) {
      delete state.items[String(action.payload)];
    },
    /** Clear entire cart */
    clearCart(state) {
      state.items = {};
      state.productData = {};
      state.serverTotal = 0;
    },
  },
  extraReducers: (builder) => {
    // ── syncCart ──
    builder.addCase(syncCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(syncCart.fulfilled, (state, action) => {
      const parsed = parseCartResponse(action.payload);
      state.items = parsed.items;
      state.productData = { ...state.productData, ...parsed.productData };
      state.serverTotal = parsed.serverTotal;
      state.loading = false;
    });
    builder.addCase(syncCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ── updateItemAsync ──
    builder.addCase(updateItemAsync.fulfilled, (state, action) => {
      const parsed = parseCartResponse(action.payload);
      state.items = parsed.items;
      state.productData = { ...state.productData, ...parsed.productData };
      state.serverTotal = parsed.serverTotal;
      state.error = null;
    });
    builder.addCase(updateItemAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      // On error, we could revert optimistic update — for now just log
    });
  },
});

export const { addItem, removeItem, clearItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Raw items map { productId → qty } */
export const selectCartItems = (state: RootState) => state.cart.items;

/** Product enrichment data */
export const selectCartProductData = (state: RootState) => state.cart.productData;

/** Total number of items across all products */
export const selectTotalItems = createSelector(
  selectCartItems,
  (items) => Object.values(items).reduce((sum, qty) => sum + qty, 0)
);

/** Full cart items with product details */
export const selectCartProducts = createSelector(
  [selectCartItems, selectCartProductData],
  (items, productData) =>
    Object.entries(items)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = productData[id];
        if (!product) {
          // Fallback: we know the ID and qty but not product data yet
          return {
            product: {
              id,
              name: "Loading...",
              priceRaw: 0,
              unit: "",
              image: "https://via.placeholder.com/150",
            },
            qty,
          };
        }
        return { product, qty };
      })
);

/** Subtotal (before delivery) */
export const selectSubtotal = createSelector(
  selectCartProducts,
  (items) =>
    items.reduce((sum, item) => sum + item.product.priceRaw * item.qty, 0)
);

/** Server-calculated total (if available) */
export const selectServerTotal = (state: RootState) => state.cart.serverTotal;

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

/** Cart loading state */
export const selectCartLoading = (state: RootState) => state.cart.loading;

/** Cart error */
export const selectCartError = (state: RootState) => state.cart.error;

// ─── Weight helpers ───────────────────────────────────────────────────────────

/**
 * Parse a product unit string into grams.
 *
 * Handles patterns like: "500g", "1kg", "1.5kg", "250ml", "200gm", "1 kg"
 * Falls back to 0 if no recognisable unit is found.
 */
function parseUnitToGrams(unit: string): number {
  if (!unit) return 0;
  const str = unit.toLowerCase().replace(/\s+/g, '');

  // Match a number followed by a unit keyword
  const match = str.match(/^([\d.]+)(kg|g|gm|ml|l)$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const suffix = match[2];

  switch (suffix) {
    case 'kg':
    case 'l':
      return value * 1000; // kg → g,  litre → ml (treat as grams for weight)
    case 'g':
    case 'gm':
    case 'ml':
      return value;
    default:
      return 0;
  }
}

/**
 * Total weight of all items in the cart, in **grams**.
 * Used to determine the shipping package type (SPS vs B2B).
 */
export const selectTotalWeightGrams = createSelector(
  [selectCartProducts],
  (cartItems) =>
    cartItems.reduce(
      (total, { product, qty }) =>
        total + parseUnitToGrams(product.unit) * qty,
      0
    )
);
