// src/features/catalog/index.ts
export { default as HomeScreen } from "./screens/HomeScreen";
export { default as CategoriesScreen } from "./screens/CategoriesScreen";
export { default as ProductScreen } from "./screens/ProductScreen";
export { default as WishlistScreen } from "./screens/WishlistScreen";
export { useWishlist } from "./hooks/useWishlist";
export { PRODUCTS, MOCK_API_PRODUCTS } from "./services/product.data";
export type { Product, ApiProduct } from "./types/product.types";
