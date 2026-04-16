import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

import Footer from "../components/ui/Footer"; // ✅ ADDED
import PRODUCTS_JSON from "../data/products.json";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  addItem,
  removeItem,
  selectCartProducts,
  selectDeliveryFee,
  selectSubtotal,
  selectTotal,
  selectTotalItems,
} from "../store/cartSlice";

// ─── PRODUCTS MAP ───
const PRODUCTS_MAP: Record<string, any> = {};
((PRODUCTS_JSON as any).items || []).forEach((p: any) => {
  if (p.item_id) PRODUCTS_MAP[p.item_id] = p;
  if (p.id && p.id !== p.item_id) PRODUCTS_MAP[p.id] = p;
  if (p.item_id != null) PRODUCTS_MAP[String(p.item_id)] = p;
  if (p.id != null) PRODUCTS_MAP[String(p.id)] = p;
});

// ─── IMAGE HELPER ───
const getImage = (p: any) =>
  p?.image ||
  (p?.image_name && p?.image_document_id
    ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
    : "https://via.placeholder.com/150");

// ─── SVG ICONS ───
const BACK_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="13" stroke="#1E1E1E" stroke-width="1.5"/>
  <path d="M15.5 9.5L11 14L15.5 18.5" stroke="#1E1E1E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ─── EMPTY CART ───
function EmptyCart() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Image
          source={require("../../assets/images/shopping-cart.png")}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>Empty Cart</Text>
        <Text style={styles.emptySubtitle}>
          There are no items to show up here,{"\n"}add items to buy.
        </Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.push("/home" as any)}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CART ITEM ───
function CartItem({ item }: any) {
  const dispatch = useAppDispatch();
  const scale = useRef(new Animated.Value(1)).current;

  const productId = item.product?.id ?? item.product?.item_id;
  const product =
    PRODUCTS_MAP[productId] ||
    PRODUCTS_MAP[String(productId)] ||
    item.product;

  if (!product) return null;

  const qty = item.qty;
  const price = product.rate ?? product.price ?? 0;
  const weight = product.weight || product.unit || product.quantity || "";
  const itemKey = product.item_id ?? product.id ?? productId;

  const pulse = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();

  return (
    <Animated.View style={[styles.cartRow, { transform: [{ scale }] }]}>
      <Image source={{ uri: getImage(product) }} style={styles.cartImage} />

      <View style={styles.cartInfo}>
        <View style={styles.cartTopRow}>
          <Text style={styles.cartName} numberOfLines={2}>
            {product.name}
          </Text>
          {!!weight && <Text style={styles.cartWeight}>{weight}</Text>}
        </View>

        <View style={styles.cartBottomRow}>
          <Text style={styles.cartPrice}>₹{price}</Text>

          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => { pulse(); dispatch(removeItem(itemKey)); }}>
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.stepQty}>{qty}</Text>

            <TouchableOpacity onPress={() => { pulse(); dispatch(addItem(itemKey)); }}>
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── MAIN ───
export default function CartScreen() {
  const cartItems = useAppSelector(selectCartProducts);
  const subtotal = useAppSelector(selectSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total = useAppSelector(selectTotal);

  const isEmpty = cartItems.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/home" as any)}>
          <SvgXml xml={BACK_ICON} width={28} height={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* SAME CONTENT */}
            <View style={{ height: 140 }} />
          </ScrollView>

          {/* ✅ REPLACED FOOTER */}
          <Footer />
        </>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },

  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerTitle: { fontSize: 16, fontWeight: "700" },

  scrollContent: {
    padding: 12,
    paddingBottom: 130, // ✅ adjusted for footer
  },

  cartRow: { flexDirection: "row", marginBottom: 10 },
  cartImage: { width: 70, height: 70, borderRadius: 8 },
  cartInfo: { flex: 1, marginLeft: 10 },

  cartTopRow: { flexDirection: "row", justifyContent: "space-between" },
  cartName: { fontSize: 13, fontWeight: "600", flex: 1 },
  cartWeight: { fontSize: 11, color: "#888" },

  cartBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  cartPrice: { fontWeight: "700" },

  stepper: {
    flexDirection: "row",
    backgroundColor: "#196F1B",
    borderRadius: 8,
    alignItems: "center",
  },

  stepText: { color: "#fff", paddingHorizontal: 10, fontSize: 16 },
  stepQty: { color: "#fff", fontWeight: "700" },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptySubtitle: {
    color: "#777",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },

  shopBtn: {
    backgroundColor: "#196F1B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  shopBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});