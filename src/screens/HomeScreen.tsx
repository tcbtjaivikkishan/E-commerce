import { router, usePathname } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BannerCarousel from "../components/ui/BannerCarousel";
import PRODUCTS_JSON from "../data/products.json";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

const PRODUCTS = (PRODUCTS_JSON as any).items ?? [];

const TABS = [
  { icon: "🏠", label: "Home", route: "/home" },
  { icon: "🛒", label: "Cart", route: "/cart" },
  { icon: "⊞", label: "Categories", route: "/categories" },
  { icon: "📄", label: "Orders", route: "/orders" },
];

export default function HomeScreen() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const { add, remove, getQty, totalItems } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const bestSellers = useMemo(() => PRODUCTS.slice(0, 10), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F7B3C" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.brand}>Jaivik Mart</Text>
            <Text style={styles.delivery}>2–3 days</Text>
            <Text style={styles.address}>HOME - Ranaji, Jabalpur ▼</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.profile}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Text>🔍</Text>
          <TextInput
            placeholder='Search "Agnihotra"'
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
          <Text>🎤</Text>
        </View>
      </View>

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

      {/* FOOTER */}
      <View style={styles.footerWrapper}>
        <View style={styles.footer}>
          {TABS.map((tab) => {
            const active = pathname === tab.route;

            return (
              <TouchableOpacity
                key={tab.route}
                onPress={() => router.push(tab.route)}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <View
                    style={[styles.iconWrap, active && styles.iconWrapActive]}
                  >
                    <Text style={styles.tabIcon}>{tab.icon}</Text>
                  </View>

                  {tab.route === "/cart" && totalItems > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {totalItems > 9 ? "9+" : totalItems}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* PRODUCT CARD */
function ProductCard({ p, add, remove, getQty, toggle, isWishlisted }: any) {
  const image =
    p.image ||
    (p.image_name && p.image_document_id
      ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
      : null);

  const qty = getQty(p.item_id);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${p.item_id}`)} // ✅ FIXED
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
            style={styles.stepTouchable}
            onPress={(e) => {
              e.stopPropagation();
              remove(p.item_id);
            }}
          >
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{qty}</Text>

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

/* STYLES */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0F7B3C",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brand: { color: "#FFD700", fontSize: 12, fontWeight: "bold" },
  delivery: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  address: { color: "#fff", fontSize: 12 },
  profile: { fontSize: 18, color: "#fff" },

  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, marginLeft: 8 },

  section: { fontSize: 16, fontWeight: "700", margin: 16 },

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
    zIndex: 10,
  },
  img: { width: "100%", height: 90, resizeMode: "contain" },
  weight: { fontSize: 12, color: "#777" },
  priceRow: { flexDirection: "row" },
  price: { fontWeight: "700" },
  mrp: { textDecorationLine: "line-through", marginLeft: 6, fontSize: 12 },
  name: { fontSize: 13 },

  addBtn: {
    borderWidth: 1.5,
    borderColor: "#0F7B3C",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  addText: { color: "#0F7B3C", fontWeight: "700" },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F7B3C",
    borderRadius: 8,
  },
  stepTouchable: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  qty: { color: "#fff", fontWeight: "bold" },

  footerWrapper: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    elevation: 12,
  },
  tab: { alignItems: "center", paddingHorizontal: 20 },

  iconContainer: {
    position: "relative",
    width: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: "#E8F5E9" },
  tabIcon: { fontSize: 26 },

  tabLabel: { fontSize: 10, color: "#888" },
  tabLabelActive: { color: "#0F7B3C", fontWeight: "700" },

  badge: {
    position: "absolute",
    top: -4,
    right: -2,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});