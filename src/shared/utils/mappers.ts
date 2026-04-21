// src/shared/utils/mappers.ts
// ─── Data mapping utilities ─────────────────────────────────────────────────

import type { ApiProduct, Product } from "../../features/catalog/types/product.types";

/**
 * Maps an API product response to the app's internal Product shape.
 * Used when fetching from the live Zoho Commerce API.
 */
export function mapApiProduct(api: ApiProduct, fallbackImage?: string): Product {
  const imageUrl = api.image?.document_id
    ? `https://your-api-base.com/images/${api.image.document_id}/${api.image.name}`
    : fallbackImage ?? "https://images.unsplash.com/photo-1592928302636-c83cf1e1f5a5?w=400";

  const weightUnit = api.dimensions?.weight
    ? api.dimensions.weight >= 1
      ? `${api.dimensions.weight} kg`
      : `${api.dimensions.weight * 1000}g`
    : "1 piece";

  return {
    id: api.zoho_item_id,
    name: api.name,
    priceRaw: api.price,
    unit: weightUnit,
    image: imageUrl,
    category: api.category?.name ?? "General",
    categoryId: api.category?.id ?? "",
    stock: api.inventory?.stock ?? 0,
    description: api.description ?? "",
    sku: api.sku,
    dimensions: api.dimensions,
  };
}

/**
 * Constructs a CDN image URL from a Zoho Commerce product record.
 */
export function getZohoImageUrl(imageName: string, documentId: string): string {
  return `https://cdn2.zohoecommerce.com/product-images/${imageName}/${documentId}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
}
