// src/features/catalog/types/product.types.ts
// ─── Product domain types ───────────────────────────────────────────────────

/** Shape returned by the Zoho Commerce API */
export type ApiProduct = {
  zoho_item_id: string;
  name: string;
  description: string;
  sku: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  inventory: {
    stock: number;
    track_inventory: boolean;
  };
  dimensions: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
  image: {
    document_id: string;
    name: string;
  };
  status: "active" | "inactive";
  show_in_storefront: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Normalised product shape used throughout the app UI */
export type Product = {
  id: string;
  name: string;
  priceRaw: number;
  mrp?: number;
  unit: string;
  image: string;
  tag?: "Organic" | "Fresh" | "New" | "Sale";
  category: string;
  categoryId: string;
  rating?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPct?: number;
  stock: number;
  description: string;
  sku: string;
  dimensions: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
};
