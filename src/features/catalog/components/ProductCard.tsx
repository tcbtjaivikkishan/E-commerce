// src/components/product/ProductCard.tsx
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Product } from "../types/product.types";
import { formatPrice } from "../../../shared/utils/formatters";
import { Colors, FontSize, FontWeight, Radius, Spacing, TAG_COLORS } from "../../../core/theme";

type Props = {
  product: Product;
  variant?: "horizontal" | "grid";
  qty: number;
  isWishlisted: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onWishlist: () => void;
};

export default function ProductCard({
  product,
  variant = "horizontal",
  qty,
  isWishlisted,
  onAdd,
  onRemove,
  onWishlist,
}: Props) {
  const isGrid = variant === "grid";
  const tagColors = product.tag ? TAG_COLORS[product.tag] : null;

  const hasDiscount = product.mrp && product.mrp > product.priceRaw;
  const discountPct = hasDiscount
    ? Math.round(((product.mrp! - product.priceRaw) / product.mrp!) * 100)
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/product/${product.id}`)}
      style={[styles.card, isGrid ? styles.cardGrid : styles.cardHorizontal]}
    >
      {/* ── Image area ── */}
      <View style={styles.imgWrap}>
        <Image source={{ uri: typeof product.image === 'string' ? product.image : (product.image as any)?.image_url ?? '' }} style={styles.img} resizeMode="cover" />
        {tagColors && product.tag && (
          <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
            <Text style={[styles.tagText, { color: tagColors.text }]}>{product.tag}</Text>
          </View>
        )}

        {/* Wishlist button – top-right */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={(e) => {
            e.stopPropagation();
            onWishlist();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.wishlistIcon}>{isWishlisted ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Info area ── */}
      <View style={styles.info}>
        {/* Unit / weight line */}
        <Text style={styles.unit} numberOfLines={1}>
          {product.unit}
        </Text>

        {/* Product name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price row + Add/Stepper */}
        <View style={styles.footer}>
          {/* Price block */}
          <View style={styles.priceBlock}>
            <Text style={styles.price}>₹{product.priceRaw}</Text>
            {hasDiscount && (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            )}
          </View>

          {/* Add button / Stepper */}
          {qty === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>ADD</Text>
              <Text style={styles.addBtnPlus}>+</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepCount}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
              >
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Card shell ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHorizontal: {
    width: 140,
    marginRight: Spacing.md,
  },
  cardGrid: {
    flex: 1,
  },

  // ── Image wrapper ────────────────────────────────────────────────────────────
  imgWrap: {
    height: 120,
    backgroundColor: "#F8F8F8",
    position: "relative",
  },
  img: {
    width: "100%",
    height: "100%",
  },

  // ── Badges ───────────────────────────────────────────────────────────────────
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#318616",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 9,
    fontWeight: "800" as any,
    color: "#fff",
    letterSpacing: 0.3,
  },
  tag: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  wishlistBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistIcon: {
    fontSize: 12,
  },

  // ── Info panel ───────────────────────────────────────────────────────────────
  info: {
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 8,
  },
  unit: {
    fontSize: 11,
    color: Colors.gray500,
    marginBottom: 2,
    fontWeight: "500" as any,
  },
  name: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.gray900,
    lineHeight: 15,
    marginBottom: 8,
  },

  // ── Footer: price + action ───────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceBlock: {
    flexDirection: "column",
    flex: 1,              // ← takes remaining space, pushes button right
    marginRight: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: "800" as any,
    color: Colors.gray900,
    lineHeight: 16,
  },
  mrp: {
    fontSize: 10,
    color: Colors.gray500,
    textDecorationLine: "line-through",
    lineHeight: 13,
  },

  // ADD button — white bg, green border, "ADD +" text (Blinkit style)
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",       // ← never stretches full width
    borderWidth: 1.5,
    borderColor: "#318616",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.white,
    // gap not used – use marginLeft on plus text instead (RN <0.71 compat)
  },
  addBtnText: {
    color: "#318616",
    fontSize: 12,
    fontWeight: "800" as any,
    letterSpacing: 0.5,
  },
  addBtnPlus: {
    color: "#318616",
    fontSize: 14,
    fontWeight: "800" as any,
    lineHeight: 16,
    marginLeft: 2,
  },

  // Stepper — solid green background
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#318616",
    borderRadius: 6,
    overflow: "hidden",
  },
  stepBtn: {
    width: 26,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: FontWeight.bold,
    lineHeight: 20,
  },
  stepCount: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    width: 22,
    textAlign: "center",
  },
});