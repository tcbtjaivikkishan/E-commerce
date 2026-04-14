import { router, usePathname } from "expo-router";
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
import { Product, PRODUCTS } from "../constants/data";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

const TABS = [
  { label: "Home",       route: "/(tabs)/home"       },
  { label: "Cart",       route: "/(tabs)/cart"       },
  { label: "Categories", route: "/(tabs)/categories" },
  { label: "Orders",     route: "/(tabs)/orders"     },
];

export default function HomeScreen() {
  const pathname = usePathname();

  // ✅ useCart.add expects (id: string) — not a Product object
  const { add, remove, getQty } = useCart();

  // ✅ useWishlist.toggle expects (id: string)
  const { isWishlisted, toggle } = useWishlist();

  const bestSellers: Product[] = useMemo(
    () => PRODUCTS.filter((p) => p.isNew),
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#196F1B" />

      {/* ── Shared Header ── */}
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
          {PRODUCTS.slice(0, 5).map((p) => (
            <ProductCard
              key={p.id}
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
          {bestSellers.map((p) => (
            <ProductCard
              key={p.id}
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

// ─── Product Card ─────────────────────────────────────────────────────────────
// ✅ Typed to match useCart and useWishlist hook signatures exactly
interface ProductCardProps {
  p: Product;
  add: (id: string) => void;
  remove: (id: string) => void;
  getQty: (id: string) => number;
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

function ProductCard({ p, add, remove, getQty, toggle, isWishlisted }: ProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${p.id}` as any)}
    >
      <TouchableOpacity style={styles.wishlist} onPress={() => toggle(p.id)}>
        <Text>{isWishlisted(p.id) ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      <Image source={{ uri: p.image }} style={styles.img} />

      <View style={{ flex: 1 }}>
        <Text style={styles.weight}>{p.unit}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{p.priceRaw}</Text>
          {p.mrp && <Text style={styles.mrp}>₹{p.mrp}</Text>}
        </View>
        <Text numberOfLines={2} style={styles.name}>{p.name}</Text>
      </View>

      {getQty(p.id) === 0 ? (
        // ✅ Pass p.id (string) not the whole product object
        <TouchableOpacity style={styles.addBtn} onPress={() => add(p.id)}>
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => remove(p.id)}>
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{getQty(p.id)}</Text>
          <TouchableOpacity onPress={() => add(p.id)}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    alignItems: "center",
    marginTop: 2,
  },

  price: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111",
  },

  mrp: {
    textDecorationLine: "line-through",
    marginLeft: 6,
    fontSize: 12,
    color: "#aaa",
  },

  name: {
    fontSize: 13,
    marginTop: 2,
    color: "#333",
  },

  addBtn: {
    borderWidth: 1.5,
    borderColor: "#196F1B",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 6,
  },

  addText: {
    color: "#196F1B",
    fontWeight: "700",
    fontSize: 13,
  },

  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#196F1B",
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
  },

  stepText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  qty: {
    color: "#fff",
    fontWeight: "700",
  },
});
