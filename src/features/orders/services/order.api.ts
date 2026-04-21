// src/features/orders/services/order.api.ts
// ─── Real API calls for orders ───────────────────────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderAddress {
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  addressLine: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number;
  image?: string;
  sku?: string;
  zohoItemId?: string;
}

export interface OrderResponse {
  _id?: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCharge: number;
  finalAmount: number;
  orderStatus: "created" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  address: OrderAddress;
  paymentSessionId?: string;
  paymentId?: string;
  zohoSalesOrderId?: string;
  isSyncedToZoho?: boolean;
  shipmentId?: string;
  trackingId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  paymentSessionId: string;
}

export interface PaginatedOrdersResponse {
  data: OrderResponse[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * POST /orders — create order from cart [JWT]
 */
export async function createOrder(address: OrderAddress): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>("/orders", {
    method: "POST",
    body: { address },
  });
}

/**
 * GET /orders?page=&limit= — list user's orders [JWT]
 */
export async function fetchOrders(
  page = 1,
  limit = 10
): Promise<PaginatedOrdersResponse> {
  return apiRequest<PaginatedOrdersResponse>(
    `/orders?page=${page}&limit=${limit}`
  );
}

/**
 * GET /orders/:orderId — full order detail [JWT]
 */
export async function fetchOrderById(orderId: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/orders/${orderId}`);
}

/**
 * PATCH /orders/:orderId/cancel — cancel an eligible order [JWT]
 */
export async function cancelOrder(
  orderId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
}
