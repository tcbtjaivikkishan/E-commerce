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
import Footer from "../components/ui/Footer"; // ✅ ADDED
import PRODUCTS_JSON from "../data/products.json";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

const PRODUCTS = (PRODUCTS_JSON as any).items ?? [];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const bestSellers = useMemo(() => PRODUCTS.slice(0, 10), []);

  const CARD_WIDTH = (width - 16 * 2 - 12 * 2) / 3;
  const CARD_HEIGHT = CARD_WIDTH * 1.35; // ✅ slightly reduced for better fit

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#196F1B" />

      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent} // ✅ FIXED
        showsVerticalScrollIndicator={false}
      >
        <BannerCarousel />

        {/* Recently Searched */}
        <Text style={styles.section}>Recently Searched</Text>
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
              cardHeight={CARD_HEIGHT}
            />
          ))}
        </ScrollView>

        {/* Best Sellers */}
        <Text style={styles.section}>Our Bestsellers</Text>
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
              cardHeight={CARD_HEIGHT}
            />
          ))}
        </ScrollView>
      </ScrollView>

      {/* ✅ GLOBAL FOOTER */}
      <Footer />
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
  cardHeight,
}: any) {
  const image =
    p.image ||
    (p.image_name && p.image_document_id
      ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
      : null);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${p.item_id}` as any)}
    >
      <TouchableOpacity
        style={styles.wishlist}
        onPress={(e) => {
          e.stopPropagation();
          toggle(p.item_id);
        }}
      >
        <Text>{isWishlisted(p.item_id) ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.img} />}

      <View style={styles.cardContent}>
        <Text style={styles.weight}>{p.unit}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{p.rate}</Text>
          {p.label_rate && <Text style={styles.mrp}>₹{p.label_rate}</Text>}
        </View>

        <Text numberOfLines={2} style={styles.name}>
          {p.name}
        </Text>
      </View>

      <View style={styles.bottomArea}>
        {getQty(p.item_id) === 0 ? (
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
              style={styles.stepTouchable}
              onPress={(e) => {
                e.stopPropagation();
                remove(p.item_id);
              }}
            >
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{getQty(p.item_id)}</Text>

            <TouchableOpacity
              style={styles.stepTouchable}
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

  // ✅ IMPORTANT FIX FOR FOOTER SPACE
  scrollContent: {
    paddingBottom: 130,
  },

  section: {
    fontSize: 15,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },

  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 8,
    marginRight: 12,
    elevation: 2,
    justifyContent: "space-between",
  },

  wishlist: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 1,
  },

  img: {
    width: "100%",
    height: "40%",
    resizeMode: "contain",
  },

  cardContent: {
    flex: 1,
    marginTop: 4,
  },

  weight: {
    fontSize: 11,
    color: "#777",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  price: {
    fontWeight: "700",
    fontSize: 13,
  },

  mrp: {
    textDecorationLine: "line-through",
    marginLeft: 4,
    fontSize: 10,
    color: "#777",
  },

  name: {
    fontSize: 12,
    lineHeight: 14,
    marginTop: 2,
    color: "#222",
  },

  bottomArea: {
    marginTop: 4,
  },

  addBtn: {
    borderWidth: 1.2,
    borderColor: "#196F1B",
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: "center",
  },

  addText: {
    color: "#196F1B",
    fontWeight: "700",
    fontSize: 12,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#196F1B",
    borderRadius: 6,
    paddingHorizontal: 4,
  },

  stepTouchable: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  stepText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  qty: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});