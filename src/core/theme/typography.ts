// src/core/theme/typography.ts
// ─── Typography design tokens ───────────────────────────────────────────────

export const FontSize = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28, h1: 34,
} as const;

export const FontWeight = {
  regular:   "400" as const,
  medium:    "500" as const,
  semibold:  "600" as const,
  bold:      "700" as const,
  extrabold: "800" as const,
};

/** Short alias */
export const F = FontSize;
