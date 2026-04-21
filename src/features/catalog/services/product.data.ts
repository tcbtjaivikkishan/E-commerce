// src/features/catalog/services/product.data.ts
// ─── Product mock data & mapping (will be replaced by API calls) ────────────

import type { ApiProduct, Product } from "../types/product.types";

// ─── Mock API Products (matching actual API response shape) ───────────────────

export const MOCK_API_PRODUCTS: ApiProduct[] = [
  {
    zoho_item_id: "2876968000000372071",
    name: "AGNIHOTRA KIT",
    description: "Traditional Agnihotra havan kit with copper vessel, ghee, and rice. Purifies the environment and promotes wellbeing.",
    sku: "64",
    category: { id: "2876968000000541027", name: "उत्प्रेरक" },
    price: 2150,
    inventory: { stock: 9962, track_inventory: true },
    dimensions: { weight: 1, length: 18, width: 18, height: 20 },
    image: { document_id: "2876968000000767672", name: "agnihotra-kit.png" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-01T12:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372072",
    name: "Organic Turmeric Powder",
    description: "Pure organic turmeric sourced directly from farms in Madhya Pradesh. Rich in curcumin, ideal for cooking and health.",
    sku: "65",
    category: { id: "2876968000000541028", name: "Spices & Herbs" },
    price: 98,
    inventory: { stock: 450, track_inventory: true },
    dimensions: { weight: 0.5, length: 10, width: 5, height: 3 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-03-01T12:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372073",
    name: "Fresh Spinach Bundle",
    description: "Freshly harvested spinach, pesticide-free. Delivered within 24 hours of harvest.",
    sku: "66",
    category: { id: "2876968000000541029", name: "Vegetables" },
    price: 25,
    inventory: { stock: 120, track_inventory: true },
    dimensions: { weight: 0.25, length: 20, width: 15, height: 5 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-03-10T08:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372074",
    name: "Organic Tomatoes",
    description: "Vine-ripened organic tomatoes, hand-picked for freshness. No artificial ripening.",
    sku: "67",
    category: { id: "2876968000000541029", name: "Vegetables" },
    price: 36,
    inventory: { stock: 200, track_inventory: true },
    dimensions: { weight: 1, length: 15, width: 15, height: 10 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-03-10T08:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372075",
    name: "Bio Neem Pesticide",
    description: "100% bio-based neem oil pesticide. Safe for vegetables, fruits, and herbs. FSSAI approved.",
    sku: "68",
    category: { id: "2876968000000541030", name: "Bio Pesticides" },
    price: 299,
    inventory: { stock: 85, track_inventory: true },
    dimensions: { weight: 0.5, length: 8, width: 8, height: 20 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-03-01T12:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372076",
    name: "Basmati Rice Organic",
    description: "Premium aged organic basmati rice from the foothills of the Himalayas. Long grain, fragrant, and fluffy.",
    sku: "69",
    category: { id: "2876968000000541031", name: "Grains & Pulses" },
    price: 180,
    inventory: { stock: 340, track_inventory: true },
    dimensions: { weight: 1, length: 25, width: 15, height: 5 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-03-05T09:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372077",
    name: "Golden Apples (Himachali)",
    description: "Crisp and sweet golden apples directly from Himachal Pradesh orchards. Rich in dietary fiber.",
    sku: "70",
    category: { id: "2876968000000541032", name: "Fresh Fruits" },
    price: 120,
    inventory: { stock: 75, track_inventory: true },
    dimensions: { weight: 1, length: 20, width: 20, height: 15 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-03-12T10:00:00Z",
  },
  {
    zoho_item_id: "2876968000000372078",
    name: "Organic Vermicompost",
    description: "Premium vermicompost from earthworm castings. Enriches soil, improves water retention, and boosts crop yield naturally.",
    sku: "71",
    category: { id: "2876968000000541033", name: "Fertilizers" },
    price: 350,
    inventory: { stock: 210, track_inventory: true },
    dimensions: { weight: 5, length: 30, width: 20, height: 10 },
    image: { document_id: "", name: "" },
    status: "active",
    show_in_storefront: true,
    createdAt: "2024-01-30T10:00:00Z",
    updatedAt: "2024-03-08T11:00:00Z",
  },
];

// ─── Fallback images (until CDN is live) ─────────────────────────────────────

const FALLBACK_IMAGES: Record<string, string> = {
  "2876968000000372071": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400",
  "2876968000000372072": "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400",
  "2876968000000372073": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
  "2876968000000372074": "https://images.unsplash.com/photo-1592928302636-c83cf1e1f5a5?w=400",
  "2876968000000372075": "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=400",
  "2876968000000372076": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
  "2876968000000372077": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
  "2876968000000372078": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
};

// Additional product meta not in the API (UI-only flags)
const PRODUCT_META: Record<string, Partial<Product>> = {
  "2876968000000372071": { tag: "New",     isFeatured: true, isNew: true, discountPct: 10, mrp: 2389, rating: 4.5 },
  "2876968000000372072": { tag: "Organic", isFeatured: true, isNew: true, discountPct: 18, mrp: 120,  rating: 4.8 },
  "2876968000000372073": { tag: "Fresh",   isNew: true,                                               rating: 4.3 },
  "2876968000000372074": { tag: "Organic", isFeatured: true, isNew: true, discountPct: 10, mrp: 40,   rating: 4.5 },
  "2876968000000372075": { tag: "New",     isNew: true,                                               rating: 4.2 },
  "2876968000000372076": { tag: "Organic", isFeatured: true,              discountPct: 14, mrp: 210,  rating: 4.7 },
  "2876968000000372077": { tag: "Fresh",   isNew: true,                                               rating: 4.6 },
  "2876968000000372078": { tag: "Sale",    isFeatured: true,              discountPct: 12, mrp: 399,  rating: 4.4 },
};

/** Pre-built product list from mock API data, enriched with UI meta */
export const PRODUCTS: Product[] = MOCK_API_PRODUCTS.filter(
  (p) => p.status === "active" && p.show_in_storefront
).map((api) => {
  const w = api.dimensions?.weight;
  const weightUnit = w ? (w >= 1 ? `${w} kg` : `${w * 1000}g`) : "1 piece";

  const base: Product = {
    id: api.zoho_item_id,
    name: api.name,
    priceRaw: api.price,
    unit: weightUnit,
    image: FALLBACK_IMAGES[api.zoho_item_id] ?? "https://images.unsplash.com/photo-1585499193151-0b72b4e6b983?w=400",
    category: api.category?.name ?? "General",
    categoryId: api.category?.id ?? "",
    stock: api.inventory?.stock ?? 0,
    description: api.description ?? "",
    sku: api.sku,
    dimensions: api.dimensions,
  };

  return { ...base, ...(PRODUCT_META[api.zoho_item_id] ?? {}) };
});
