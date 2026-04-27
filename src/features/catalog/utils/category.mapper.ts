// src/features/catalog/utils/category.mapper.ts

import { ApiCategory, Category } from "../types/category.types";

export function mapApiCategoryToCategory(api: ApiCategory): Category {
  return {
    id: api.category_id, // ✅ MUST match product.category_id
    name: api.name,
  };
}