// src/features/catalog/services/product.api.ts
// ─── Real API calls for products & categories ────────────────────────────────

import { apiRequest } from "../../../shared/services/api.client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiProductResponse {
  _id: string;
  zoho_item_id: string;
  name: string;
  description?: string;
  sku?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  stock: number;
  image: {
    image_url?: string;
  };
  is_active: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CategoryResponse {
  _id?: string;
  category_id: string;
  name: string;
  is_active?: boolean;
}

let productsCache: ApiProductResponse[] | null = null;

export function getCachedProducts(): ApiProductResponse[] {
  return productsCache ?? [];
}

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * GET /products — all active storefront products
 * The API may return a plain array or an object like { data: [...] } or { items: [...] }
 */
export async function fetchAllProducts(): Promise<ApiProductResponse[]> {
  if (productsCache) return productsCache;

  const raw = await apiRequest<any>("/products", { skipAuth: true });
  // Normalize: could be array directly, or { data: [] }, { items: [] }, { products: [] }
  if (Array.isArray(raw)) {
    productsCache = raw;
    return productsCache;
  }
  if (raw?.data && Array.isArray(raw.data)) {
    productsCache = raw.data;
    return raw.data;
  }
  if (raw?.items && Array.isArray(raw.items)) {
    productsCache = raw.items;
    return raw.items;
  }
  if (raw?.products && Array.isArray(raw.products)) {
    productsCache = raw.products;
    return raw.products;
  }
  console.warn("[fetchAllProducts] Unexpected response shape:", typeof raw, Object.keys(raw || {}));
  return [];
}

/**
 * GET /products/paginated?page=&limit=
 */
export async function fetchPaginatedProducts(
  page = 1,
  limit = 10
): Promise<PaginatedResponse<ApiProductResponse>> {
  return apiRequest<PaginatedResponse<ApiProductResponse>>(
    `/products/paginated?page=${page}&limit=${limit}`,
    { skipAuth: true }
  );
}

/**
 * GET /products/:id — by Mongo _id or zoho_item_id
 */
export async function fetchProductById(
  id: string
): Promise<ApiProductResponse> {
  return apiRequest<ApiProductResponse>(`/products/id/${id}`, { skipAuth: true });
}

/**
 * GET /products/filter — with search, category, price filters
 */
export async function fetchFilteredProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<PaginatedResponse<ApiProductResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.search) query.set("search", params.search);

  return apiRequest<PaginatedResponse<ApiProductResponse>>(
    `/products/filter?${query.toString()}`,
    { skipAuth: true }
  );
}

// ─── Categories ──────────────────────────────────────────────────────────────

/**
 * GET /categories — all active categories
 */
export async function fetchCategories(): Promise<CategoryResponse[]> {
  return apiRequest<CategoryResponse[]>("/categories", { skipAuth: true });
}
