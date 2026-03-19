// src/constants/data.ts — Updated to match API response structure

// ─── API Types ────────────────────────────────────────────────────────────────

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

// ─── App Types ────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  label: string;
  emoji: string;
  bgColor: string;
  featherIcon: string;
};

export type Product = {
  id: string;               // maps to zoho_item_id
  name: string;
  priceRaw: number;         // maps to price
  mrp?: number;
  unit: string;             // derived from dimensions.weight
  image: string;            // constructed from image.document_id / image.name
  tag?: "Organic" | "Fresh" | "New" | "Sale";
  category: string;         // maps to category.name
  categoryId: string;       // maps to category.id
  rating?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPct?: number;
  stock: number;            // maps to inventory.stock
  description: string;
  sku: string;
  dimensions: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
};

export type Banner = {
  id: string;
  title: string;
  sub?: string;
  bgColor: string;
  isNew?: boolean;
};

export type FreqCat = {
  id: string;
  label: string;
  images: [string, string, string];
  moreCount: number;
};

export type GridCat = {
  id: string;
  label: string;
  image: string;
};

export type FarmCat = {
  id: string;
  label: string;
  icon: string;
  bgColor: string;
  imgBg: string;
};

// ─── Helper: Map API response to Product ─────────────────────────────────────

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

// ─── Static data ──────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: "all",          label: "All",          emoji: "⊞",  bgColor: "#1B4332", featherIcon: "grid"    },
  { id: "seeds",        label: "Seeds",        emoji: "🌱", bgColor: "#E8F5E9", featherIcon: "sun"     },
  { id: "pesticides",   label: "Pesticides",   emoji: "🧪", bgColor: "#F3E5F5", featherIcon: "shield"  },
  { id: "insecticides", label: "Insecticides", emoji: "🐛", bgColor: "#E3F2FD", featherIcon: "zap"     },
  { id: "food",         label: "Food",         emoji: "🍱", bgColor: "#FBE9E7", featherIcon: "coffee"  },
  { id: "fertilizers",  label: "Fertilizers",  emoji: "💧", bgColor: "#E0F7FA", featherIcon: "droplet" },
];

export const BANNERS: Banner[] = [
  { id: "b1", title: "Bio Pesticide Spray",       sub: "For You",      bgColor: "#0F4C2A", isNew: true  },
  { id: "b2", title: "Premium Seeds\nCollection", sub: undefined,      bgColor: "#1a1a2e", isNew: false },
  { id: "b3", title: "Monsoon Sale\nDeal of Day", sub: undefined,      bgColor: "#B45309", isNew: false },
  { id: "b4", title: "Organic\nFertilizers",      sub: "New arrivals", bgColor: "#164E63", isNew: false },
];

export const FREQ_CATEGORIES: FreqCat[] = [
  {
    id: "fc1", label: "Vegetables & Fruits", moreCount: 7,
    images: [
      "https://images.unsplash.com/photo-1592928302636-c83cf1e1f5a5?w=200",
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100",
      "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=100",
    ],
  },
  {
    id: "fc2", label: "Spices & Herbs", moreCount: 4,
    images: [
      "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100",
      "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=100",
    ],
  },
  {
    id: "fc3", label: "Grains & Pulses", moreCount: 3,
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100",
      "https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=100",
    ],
  },
  {
    id: "fc4", label: "Fresh Fruits", moreCount: 5,
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=100",
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=100",
    ],
  },
  {
    id: "fc5", label: "Pesticides", moreCount: 2,
    images: [
      "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=200",
      "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=100",
      "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=100",
    ],
  },
  {
    id: "fc6", label: "Fertilizers", moreCount: 1,
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
      "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=100",
      "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=100",
    ],
  },
];

export const GROCERY_CATEGORIES: GridCat[] = [
  { id: "gc1", label: "Vegetables & Fruits",  image: "https://images.unsplash.com/photo-1592928302636-c83cf1e1f5a5?w=200" },
  { id: "gc2", label: "Atta, Rice & Dal",     image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200" },
  { id: "gc3", label: "Spices & Masala",      image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200" },
  { id: "gc4", label: "Dairy & Eggs",         image: "https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=200" },
  { id: "gc5", label: "Dry Fruits & Cereals", image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200" },
  { id: "gc6", label: "Bakery & Snacks",      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200" },
  { id: "gc7", label: "Chicken & Meat",       image: "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=200" },
  { id: "gc8", label: "Kitchen Appliances",   image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200" },
];

export const FARM_CATEGORIES: FarmCat[] = [
  { id: "fmc1", label: "Bio Pesticides",   icon: "🌿", bgColor: "#F0FDF4", imgBg: "#DCFCE7" },
  { id: "fmc2", label: "Insecticides",     icon: "🧪", bgColor: "#FFF7ED", imgBg: "#FEF3C7" },
  { id: "fmc3", label: "Fertilizers",      icon: "💧", bgColor: "#EFF6FF", imgBg: "#DBEAFE" },
  { id: "fmc4", label: "Seeds",            icon: "🌱", bgColor: "#FDF4FF", imgBg: "#FAE8FF" },
  { id: "fmc5", label: "Soil Testing",     icon: "🔬", bgColor: "#FFF1F2", imgBg: "#FFE4E6" },
  { id: "fmc6", label: "Farm Tools",       icon: "⚒️", bgColor: "#F8FAFC", imgBg: "#E2E8F0" },
  { id: "fmc7", label: "Irrigation",       icon: "💦", bgColor: "#F0F9FF", imgBg: "#BAE6FD" },
  { id: "fmc8", label: "Organic Compost",  icon: "🪣", bgColor: "#FEFCE8", imgBg: "#FEF9C3" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatPrice  = (raw: number, unit: string): string => `₹${raw}/${unit}`;
export const formatPriceShort = (raw: number): string => `₹${raw}`;