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

export default function ProductCard({ product, variant = "horizontal", qty, isWishlisted, onAdd, onRemove, onWishlist }: Props) {
  const isGrid = variant === "grid";
  const tagColors = product.tag ? TAG_COLORS[product.tag] : null;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/product/${product.id}`)}
      style={[styles.card, isGrid ? styles.cardGrid : styles.cardHorizontal]}
    >
      <View style={styles.imgWrap}>
        <Image source={{ uri: product.image }} style={styles.img} resizeMode="cover" />
        {tagColors && product.tag && (
          <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
            <Text style={[styles.tagText, { color: tagColors.text }]}>{product.tag}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={(e) => { e.stopPropagation(); onWishlist(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.wishlistIcon}>{isWishlisted ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.priceRaw, product.unit)}</Text>
          {qty === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={(e) => { e.stopPropagation(); onAdd(); }}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={(e) => { e.stopPropagation(); onRemove(); }}>
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepCount}>{qty}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={(e) => { e.stopPropagation(); onAdd(); }}>
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
  card:            { backgroundColor: Colors.white, borderRadius: Radius.lg, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardHorizontal:  { width: 148, marginRight: Spacing.md },
  cardGrid:        { flex: 1 },
  imgWrap:         { height: 110, backgroundColor: Colors.gray100, position: "relative" },
  img:             { width: "100%", height: "100%" },
  tag:             { position: "absolute", top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  tagText:         { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.5, textTransform: "uppercase" },
  wishlistBtn:     { position: "absolute", top: 7, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  wishlistIcon:    { fontSize: 13 },
  info:            { padding: Spacing.md, paddingBottom: Spacing.sm },
  name:            { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.gray900, lineHeight: 16, marginBottom: 3 },
  unit:            { fontSize: FontSize.xs, color: Colors.gray500, marginBottom: Spacing.sm },
  footer:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price:           { fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.greenDeep },
  addBtn:          { width: 28, height: 28, borderRadius: Radius.sm, backgroundColor: Colors.greenDeep, alignItems: "center", justifyContent: "center" },
  addBtnText:      { color: Colors.white, fontSize: 18, fontWeight: FontWeight.regular, lineHeight: 22 },
  stepper:         { flexDirection: "row", alignItems: "center", backgroundColor: Colors.greenDeep, borderRadius: Radius.sm, overflow: "hidden" },
  stepBtn:         { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  stepText:        { color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold },
  stepCount:       { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold, minWidth: 20, textAlign: "center" },
});
