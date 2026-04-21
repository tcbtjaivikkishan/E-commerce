// src/core/constants/banners.ts
// ─── Static banner data ─────────────────────────────────────────────────────

export type Banner = {
  id: string;
  title: string;
  sub?: string;
  bgColor: string;
  isNew?: boolean;
};

export const BANNERS: Banner[] = [
  { id: "b1", title: "Bio Pesticide Spray",       sub: "For You",      bgColor: "#0F4C2A", isNew: true  },
  { id: "b2", title: "Premium Seeds\nCollection", sub: undefined,      bgColor: "#1a1a2e", isNew: false },
  { id: "b3", title: "Monsoon Sale\nDeal of Day", sub: undefined,      bgColor: "#B45309", isNew: false },
  { id: "b4", title: "Organic\nFertilizers",      sub: "New arrivals", bgColor: "#164E63", isNew: false },
];
