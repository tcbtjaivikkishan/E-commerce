import { router } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import BannerCarousel from "../components/ui/BannerCarousel";
import Header from "../components/ui/Header";
import PRODUCTS_JSON from "../data/products.json";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

const PRODUCTS = (PRODUCTS_JSON as any).items ?? [];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const bestSellers = useMemo(() => PRODUCTS.slice(0, 10), []);

  // Show exactly 3 cards + a peek of the 4th
  // Formula: (screenWidth - leftPadding - gaps between 3 cards) / 3.2
  const CARD_WIDTH = (width - 16 - 10 * 3) / 3.15;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#196F1B" />

      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BannerCarousel />

        {/* Recently Searched */}
        <Text style={styles.sectionTitle}>Recently Searched</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {PRODUCTS.slice(0, 5).map((p: any) => (
            <ProductCard
              key={p.item_id}
              p={p}
              add={add}
              remove={remove}
              getQty={getQty}
              toggle={toggle}
              isWishlisted={isWishlisted}
              cardWidth={CARD_WIDTH}
            />
          ))}
        </ScrollView>

        {/* Best Sellers */}
        <Text style={styles.sectionTitle}>Our Bestsellers</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {bestSellers.map((p: any) => (
            <ProductCard
              key={p.item_id}
              p={p}
              add={add}
              remove={remove}
              getQty={getQty}
              toggle={toggle}
              isWishlisted={isWishlisted}
              cardWidth={CARD_WIDTH}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Product Card ─────────────────────────────
function ProductCard({
  p,
  add,
  remove,
  getQty,
  toggle,
  isWishlisted,
  cardWidth,
}: any) {
  const image =
    p.image ||
    (p.image_name && p.image_document_id
      ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
      : null);

  const qty = getQty(p.item_id);
  const imgSize = cardWidth - 16; // 8px padding on each side

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${p.item_id}` as any)}
    >
      {/* Wishlist icon */}
      <TouchableOpacity
        style={styles.wishlist}
        onPress={(e) => {
          e.stopPropagation();
          toggle(p.item_id);
        }}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Text style={styles.wishlistIcon}>
          {isWishlisted(p.item_id) ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      {/* Product Image */}
      {image ? (
        <Image
          source={{ uri: image }}
          style={[styles.img, { width: imgSize, height: imgSize * 0.9 }]}
        />
      ) : (
        <View
          style={[
            styles.imgPlaceholder,
            { width: imgSize, height: imgSize * 0.9 },
          ]}
        />
      )}

      {/* Unit / weight */}
      <Text style={styles.unit}>{p.unit}</Text>

      {/* Price row */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{p.rate}</Text>
        {p.label_rate && (
          <Text style={styles.mrp}>₹{p.label_rate}</Text>
        )}
      </View>

      {/* Product name */}
      <Text numberOfLines={2} style={styles.name}>
        {p.name}
      </Text>

      {/* ADD / Stepper */}
      <View style={styles.bottomArea}>
        {qty === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation();
              add(p.item_id);
            }}
          >
            <Text style={styles.addText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepTouch}
              onPress={(e) => {
                e.stopPropagation();
                remove(p.item_id);
              }}
            >
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{qty}</Text>

            <TouchableOpacity
              style={styles.stepTouch}
              onPress={(e) => {
                e.stopPropagation();
                add(p.item_id);
              }}
            >
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    paddingBottom: 130,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  wishlist: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 2,
  },

  wishlistIcon: {
    fontSize: 12,
  },

  img: {
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 6,
  },

  imgPlaceholder: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 6,
  },

  unit: {
    fontSize: 10,
    color: "#888",
    marginBottom: 1,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  price: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
  },

  mrp: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 4,
  },

  name: {
    fontSize: 10,
    color: "#333",
    lineHeight: 13,
    marginBottom: 6,
  },

  bottomArea: {
    marginTop: 4,
  },

  addBtn: {
    borderWidth: 1.5,
    borderColor: "#196F1B",
    borderRadius: 6,
    paddingVertical: 4,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  addText: {
    color: "#196F1B",
    fontWeight: "700",
    fontSize: 11,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#196F1B",
    borderRadius: 6,
    paddingHorizontal: 2,
  },

  stepTouch: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  stepText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  qty: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    minWidth: 16,
    textAlign: "center",
  },
});