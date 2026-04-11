import { router, usePathname } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import BannerCarousel from "../components/ui/BannerCarousel";
import { PRODUCTS } from "../constants/data";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

/* TYPES */
type Product = {
  id: string;
  name: string;
  image: string;
  priceRaw: number;
  mrp: number;
  unit: string;
  isNew?: boolean;
};

const TABS = [
  { icon: "🏠", label: "Home",       route: "/home"       },
  { icon: "🛒", label: "Cart",       route: "/cart"       },
  { icon: "⊞",  label: "Categories", route: "/categories" },
  { icon: "📄", label: "Orders",     route: "/orders"     },
];

export default function HomeScreen() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const bestSellers: Product[] = useMemo(
    () => PRODUCTS.filter((p: Product) => p.isNew),
    []
  );

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

      {/* ── BLINKIT-STYLE FOOTER ── */}
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
                {/* Active tab gets a green pill behind the icon */}
                <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                    {tab.icon}
                  </Text>
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
function ProductCard({ p, add, remove, getQty, toggle, isWishlisted }) {
  return (
    <TouchableOpacity style={styles.card}>
      <TouchableOpacity style={styles.wishlist}>
        <Text>{isWishlisted(p.id) ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      <Image source={{ uri: p.image }} style={styles.img} />

      <View style={{ flex: 1 }}>
        <Text style={styles.weight}>{p.unit}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{p.priceRaw}</Text>
          <Text style={styles.mrp}>₹{p.mrp}</Text>
        </View>

        <Text numberOfLines={2} style={styles.name}>
          {p.name}
        </Text>
      </View>

      {getQty(p.id) === 0 ? (
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.stepper}>
          <Text style={styles.stepText}>−</Text>
          <Text style={styles.qty}>{getQty(p.id)}</Text>
          <Text style={styles.stepText}>+</Text>
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
  },

  brand: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
  },

  delivery: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  address: {
    color: "#fff",
    fontSize: 12,
  },

  profile: {
    fontSize: 18,
    color: "#fff",
  },

  searchBar: {
    backgroundColor: "#fff",
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  input: { flex: 1, marginLeft: 8 },

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
  },

  img: {
    width: "100%",
    height: 90,
    resizeMode: "contain",
  },

  weight: { fontSize: 12, color: "#777" },

  priceRow: { flexDirection: "row" },

  price: { fontWeight: "700" },

  mrp: {
    textDecorationLine: "line-through",
    marginLeft: 6,
    fontSize: 12,
  },

  name: { fontSize: 13 },

  addBtn: {
    borderWidth: 1.5,
    borderColor: "#0F7B3C",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },

  addText: {
    color: "#0F7B3C",
    fontWeight: "700",
  },

  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0F7B3C",
    borderRadius: 8,
    padding: 6,
  },

  stepText: { color: "#fff" },
  qty: { color: "#fff" },

  /* ── BLINKIT-STYLE FOOTER STYLES ── */
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
    alignSelf: "center",
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    // shadow for Android
    elevation: 12,
  },

  tab: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  iconWrapActive: {
    backgroundColor: "#E8F5E9", // soft green pill — exactly like Blinkit
  },

  tabIcon: {
    fontSize: 30,
  },

  tabIconActive: {
    // emoji colour can't be changed but the pill bg signals active state
  },

  tabLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "500",
  },

  tabLabelActive: {
    color: "#0F7B3C",
    fontWeight: "700",
  },
});