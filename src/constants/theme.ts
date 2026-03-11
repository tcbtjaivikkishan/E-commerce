// src/constants/theme.ts
// ─── All exports that components need ────────────────────────────────────────

export const C = {
  green:     "#0F7B3C",
  greenDark: "#0a5c2c",
  greenMid:  "#1A9A4C",
  greenLight:"#E8F5EE",
  greenPale: "#D8F3DC",
  white:     "#FFFFFF",
  black:     "#111111",
  bg:        "#F5F5F5",
  gray1:     "#F8F8F8",
  gray2:     "#EFEFEF",
  gray3:     "#D4D4D4",
  gray4:     "#9A9A9A",
  gray5:     "#666666",
  gray6:     "#333333",
  amber:     "#F59E0B",
  red:       "#DC2626",
  success:   "#0F7B3C",
  error:     "#DC2626",
  warning:   "#F59E0B",
} as const;

// Aliases used by older components (ProductCard, CategoryPills, HeroBanner, SectionHeader)
export const Colors = {
  greenDeep:    C.green,
  greenMid:     C.greenMid,
  greenBright:  "#52B788",
  greenLight:   C.greenLight,
  greenPale:    C.greenPale,
  greenBg:      "#F0FAF4",
  amber:        C.amber,
  amberLight:   "#FDEBD0",
  red:          C.red,
  white:        C.white,
  gray50:       "#F9FAFB",
  gray100:      C.gray2,
  gray300:      C.gray3,
  gray500:      C.gray4,
  gray700:      C.gray5,
  gray900:      C.black,
  success:      C.green,
  error:        C.red,
  warning:      C.amber,
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40,
} as const;

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
} as const;

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

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Organic: { bg: "#52B788",  text: "#fff" },
  Fresh:   { bg: "#29B6F6",  text: "#fff" },
  New:     { bg: C.amber,    text: "#fff" },
  Sale:    { bg: C.red,      text: "#fff" },
};

// Short alias for spacing used by some components
export const S = Spacing;
export const F = FontSize;
export const R = Radius;
