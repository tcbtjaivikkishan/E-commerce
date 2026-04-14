import { useLocalSearchParams, useRouter, usePathname } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import PRODUCTS_JSON from "../data/products.json";
import { useCart } from "../hooks/useCart";

const { width } = Dimensions.get("window");

const TABS = [
  { icon: "🏠", label: "Home", route: "/home" },
  { icon: "🛒", label: "Cart", route: "/cart" },
  { icon: "⊞", label: "Categories", route: "/categories" },
  { icon: "📄", label: "Orders", route: "/orders" },
];

const getImageUrl = (product: any): string => {
  if (product.image) return product.image;
  if (product.image_document_id && product.image_name) {
    return `https://cdn2.zohoecommerce.com/product-images/${product.image_name}/${product.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
  }
  return "https://via.placeholder.com/150";
};

const findProduct = (id: string) => {
  const items = (PRODUCTS_JSON as any).items || [];
  return items.find((item: any) => item.item_id === id);
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { add, getQty, totalItems } = useCart();

  const product = findProduct(id || "");
  const [showDetails, setShowDetails] = useState(false);

  if (!product) return null;

  const imageUrl = getImageUrl(product);
  const qty = getQty(product.item_id);
  const price = product.rate ?? product.priceRaw ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} onPress={() => router.back()} />
        <View style={styles.headerRight}>
          <Ionicons name="heart-outline" size={22} />
          <Feather name="search" size={22} />
          <Feather name="share" size={22} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 220 }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>₹{price}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Products</Text>
        </View>
      </ScrollView>

      {/* ADD TO CART — floats just above the footer pill */}
      <View style={styles.bottomCart}>
        <TouchableOpacity
          style={styles.addToCart}
          onPress={() => add(product.item_id)}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ CUSTOM FOOTER — identical to HomeScreen */}
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
                  <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
  },
  headerRight: { flexDirection: "row", gap: 16 },

  imageContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 30,
  },
  image: { width: width - 100, height: width - 100 },

  card: { backgroundColor: "#fff", padding: 16, marginTop: 8 },
  title: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 20, fontWeight: "800" },

  section: { backgroundColor: "#fff", padding: 16, marginTop: 8 },
  sectionTitle: { fontWeight: "600" },

  bottomCart: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addToCart: {
    backgroundColor: "#0F7B3C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  // ✅ Exact match with HomeScreen footer
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});