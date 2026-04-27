
import { fetchCategories as fetchRawCategories } from "./product.api";
import { mapApiCategoryToCategory } from "../utils/category.mapper";
import { Category } from "../types/category.types";

let categoryCache: Category[] | null = null;

export async function fetchAllCategories(): Promise<Category[]> {
  if (categoryCache) return categoryCache;

  const raw = await fetchRawCategories();

  categoryCache = raw.map(mapApiCategoryToCategory);

  return categoryCache;
}