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
} from "react-native";

import BannerCarousel from "../components/ui/BannerCarousel";
import Header from "../components/ui/Header";
import PRODUCTS_JSON from "../data/products.json"; // ✅ FIXED
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

const PRODUCTS = (PRODUCTS_JSON as any).items ?? [];

export default function HomeScreen() {
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const bestSellers = useMemo(() => PRODUCTS.slice(0, 10), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#196F1B" />

      {/* HEADER */}
      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      {/* CONTENT */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#F5F5F5" }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <BannerCarousel />

        <Text style={styles.section}>Recently Searched</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRODUCTS.slice(0, 5).map((p: any) => (
            <ProductCard
              key={p.item_id}
              p={p}
              add={add}
              remove={remove}
              getQty={getQty}
              toggle={toggle}
              isWishlisted={isWishlisted}
            />
          ))}
        </ScrollView>

        <Text style={styles.section}>Our Bestsellers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {bestSellers.map((p: any) => (
            <ProductCard
              key={p.item_id}
              p={p}
              add={add}
              remove={remove}
              getQty={getQty}
              toggle={toggle}
              isWishlisted={isWishlisted}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Product Card ─────────────────────────────
function ProductCard({ p, add, remove, getQty, toggle, isWishlisted }: any) {
  const image =
    p.image ||
    (p.image_name && p.image_document_id
      ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
      : null);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      // ✅ FIXED navigation
      onPress={() => router.push(`/product/${p.item_id}` as any)}
    >
      {/* Wishlist */}
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

      <View style={{ flex: 1 }}>
        <Text style={styles.weight}>{p.unit}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{p.rate}</Text>
          {p.label_rate && <Text style={styles.mrp}>₹{p.label_rate}</Text>}
        </View>

        <Text numberOfLines={2} style={styles.name}>
          {p.name}
        </Text>
      </View>

      {/* ADD / STEPPER */}
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
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────
const styles = StyleSheet.create({
  section: {
    fontSize: 16,
    fontWeight: "700",
    margin: 16,
  },

  card: {
    width: 150,
    height: 230,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginLeft: 16,
    elevation: 2,
  },

  wishlist: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },

  img: {
    width: "100%",
    height: 90,
    resizeMode: "contain",
  },

  weight: {
    fontSize: 12,
    color: "#777",
  },

  priceRow: {
    flexDirection: "row",
    marginTop: 2,
  },

  price: {
    fontWeight: "700",
  },

  mrp: {
    textDecorationLine: "line-through",
    marginLeft: 6,
    fontSize: 12,
  },

  name: {
    fontSize: 13,
  },

  addBtn: {
    borderWidth: 1.5,
    borderColor: "#196F1B",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },

  addText: {
    color: "#196F1B",
    fontWeight: "700",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#196F1B",
    borderRadius: 8,
  },

  stepTouchable: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  stepText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  qty: {
    color: "#fff",
    fontWeight: "bold",
  },
});