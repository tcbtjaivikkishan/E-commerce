// src/features/checkout/types/order.types.ts
// ─── Checkout & order domain types ──────────────────────────────────────────

export interface OrderAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderPayment {
  method: 'online' | 'cod';
}

export interface OrderSummary {
  id: string;
  total: number;
  itemsCount: number;
  timestamp: string;
  status: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  address: OrderAddress;
}
