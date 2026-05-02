// src/features/orders/store/ordersSlice.ts
import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";
import {
  fetchOrders,
  fetchOrderById,
  cancelOrder as cancelOrderApi,
  type OrderResponse,
  type PaginatedOrdersResponse,
} from "../services/order.api";

interface OrdersState {
  orders: OrderResponse[];
  currentOrder: OrderResponse | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loadOrders = createAsyncThunk(
  "orders/load",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchOrders(page, limit);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load orders");
    }
  }
);

export const loadOrderDetail = createAsyncThunk(
  "orders/loadDetail",
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await fetchOrderById(orderId);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load order");
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  "orders/cancel",
  async (orderId: string, { rejectWithValue }) => {
    try {
      await cancelOrderApi(orderId);
      return orderId;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to cancel order");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadOrders
      .addCase(loadOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        const data = action.payload as PaginatedOrdersResponse;
        state.orders = data.data;
        state.total = data.total;
        state.page = data.page;
        state.totalPages = data.totalPages;
        state.loading = false;
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // loadOrderDetail
      .addCase(loadOrderDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadOrderDetail.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(loadOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // cancelOrder
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        const orderId = action.payload;
        const order = state.orders.find((o) => o.orderId === orderId);
        if (order) {
          order.orderStatus = "cancelled";
        }
        if (state.currentOrder?.orderId === orderId) {
          state.currentOrder.orderStatus = "cancelled";
        }
      });
  },
});

export const { clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectCurrentOrderDetail = (state: RootState) =>
  state.orders.currentOrder;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectOrdersPagination = createSelector(
  (state: RootState) => state.orders.total,
  (state: RootState) => state.orders.page,
  (state: RootState) => state.orders.totalPages,
  (total, page, totalPages) => ({ total, page, totalPages })
);
