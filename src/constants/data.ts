// src/constants/data.ts — Complete, all types fully defined

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  label: string;
  emoji: string;
  bgColor: string;
  featherIcon: string;
};

export type Product = {
  id: string;
  name: string;
  priceRaw: number;
  mrp?: number;               // original MRP for strikethrough
  unit: string;
  image: string;
  tag?: "Organic" | "Fresh" | "New" | "Sale";
  category: string;
  rating?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPct?: number;       // e.g. 18 → shows "18% OFF" badge
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
  images: [string, string, string];   // exactly 3 image urls
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

// ─── Data ─────────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: "all",          label: "All",          emoji: "⊞",  bgColor: "#1B4332", featherIcon: "grid"    },
  { id: "seeds",        label: "Seeds",        emoji: "🌱", bgColor: "#E8F5E9", featherIcon: "sun"     },
  { id: "pesticides",   label: "Pesticides",   emoji: "🧪", bgColor: "#F3E5F5", featherIcon: "shield"  },
  { id: "insecticides", label: "Insecticides", emoji: "🐛", bgColor: "#E3F2FD", featherIcon: "zap"     },
  { id: "food",         label: "Food",         emoji: "🍱", bgColor: "#FBE9E7", featherIcon: "coffee"  },
  { id: "fertilizers",  label: "Fertilizers",  emoji: "💧", bgColor: "#E0F7FA", featherIcon: "droplet" },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1", name: "Organic Turmeric Root", priceRaw: 98, mrp: 120, unit: "500g",
    image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400",
    tag: "Organic", category: "food", rating: 4.8,
    isNew: true, isFeatured: true, discountPct: 18,
  },
  {
    id: "p2", name: "Fresh Spinach", priceRaw: 25, unit: "250g",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
    tag: "Fresh", category: "food", rating: 4.3, isNew: true,
  },
  {
    id: "p3", name: "Organic Tomatoes", priceRaw: 36, mrp: 40, unit: "1 kg",
    image: "https://images.unsplash.com/photo-1592928302636-c83cf1e1f5a5?w=400",
    tag: "Organic", category: "food", rating: 4.5,
    isNew: true, isFeatured: true, discountPct: 10,
  },
  {
    id: "p4", name: "Golden Apples", priceRaw: 120, unit: "1 kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    tag: "Fresh", category: "food", rating: 4.6, isNew: true,
  },
  {
    id: "p5", name: "Heirloom Potatoes", priceRaw: 45, unit: "500g",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
    tag: "New", category: "food", rating: 4.1, isFeatured: true,
  },
  {
    id: "p6", name: "Basmati Rice Organic", priceRaw: 180, mrp: 210, unit: "1 kg",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    tag: "Organic", category: "food", rating: 4.7,
    isFeatured: true, discountPct: 14,
  },
  {
    id: "p7", name: "Bio Neem Pesticide", priceRaw: 299, unit: "500ml",
    image: "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=400",
    tag: "New", category: "pesticides", rating: 4.2, isNew: true,
  },
  {
    id: "p8", name: "Banana Bunch", priceRaw: 55, unit: "12 pcs",
    image: "https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=400",
    tag: "Fresh", category: "food", rating: 4.4, isFeatured: true,
  },
];

export const BANNERS: Banner[] = [
  { id: "b1", title: "Bio Pesticide Spray",       sub: "For You",         bgColor: "#0F4C2A", isNew: true  },
  { id: "b2", title: "Premium Seeds\nCollection", sub: undefined,         bgColor: "#1a1a2e", isNew: false },
  { id: "b3", title: "Monsoon Sale\nDeal of Day", sub: undefined,         bgColor: "#B45309", isNew: false },
  { id: "b4", title: "Organic\nFertilizers",      sub: "New arrivals",    bgColor: "#164E63", isNew: false },
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
    id: "fc6", label: "Insecticides", moreCount: 1,
    images: [
      "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=200",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100",
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
  { id: "fmc1", label: "Bio Pesticides",  icon: "🌿", bgColor: "#F0FDF4", imgBg: "#DCFCE7" },
  { id: "fmc2", label: "Insecticides",    icon: "🧪", bgColor: "#FFF7ED", imgBg: "#FEF3C7" },
  { id: "fmc3", label: "Fertilizers",    icon: "💧", bgColor: "#EFF6FF", imgBg: "#DBEAFE" },
  { id: "fmc4", label: "Seeds",          icon: "🌱", bgColor: "#FDF4FF", imgBg: "#FAE8FF" },
  { id: "fmc5", label: "Soil Testing",   icon: "🔬", bgColor: "#FFF1F2", imgBg: "#FFE4E6" },
  { id: "fmc6", label: "Farm Tools",     icon: "⚒️", bgColor: "#F8FAFC", imgBg: "#E2E8F0" },
  { id: "fmc7", label: "Irrigation",     icon: "💦", bgColor: "#F0F9FF", imgBg: "#BAE6FD" },
  { id: "fmc8", label: "Organic Compost",icon: "🪣", bgColor: "#FEFCE8", imgBg: "#FEF9C3" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatPrice = (raw: number, unit: string): string => `₹${raw}/${unit}`;
