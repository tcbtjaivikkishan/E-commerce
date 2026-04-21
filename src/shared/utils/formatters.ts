// src/shared/utils/formatters.ts
// ─── Formatting utilities ───────────────────────────────────────────────────

export const formatPrice = (raw: number, unit: string): string =>
  `₹${raw}/${unit}`;

export const formatPriceShort = (raw: number): string =>
  `₹${raw}`;

export const formatWeight = (weightKg: number): string => {
  if (!weightKg) return "1 piece";
  return weightKg >= 1 ? `${weightKg} kg` : `${weightKg * 1000}g`;
};
