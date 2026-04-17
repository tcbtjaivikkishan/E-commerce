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

// ─── PRODUCTS MAP ─────────────────────────────────────────────────────────────
const PRODUCTS_MAP: Record<string, any> = {};
((PRODUCTS_JSON as any).items || []).forEach((p: any) => {
  if (p.item_id) PRODUCTS_MAP[p.item_id] = p;
  if (p.id && p.id !== p.item_id) PRODUCTS_MAP[p.id] = p;
  if (p.item_id != null) PRODUCTS_MAP[String(p.item_id)] = p;
  if (p.id != null) PRODUCTS_MAP[String(p.id)] = p;
});

// ─── IMAGE HELPER ─────────────────────────────────────────────────────────────
const getImage = (p: any) =>
  p?.image ||
  (p?.image_name && p?.image_document_id
    ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
    : "https://via.placeholder.com/150");

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const BACK_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="13" stroke="#1E1E1E" stroke-width="1.5"/>
  <path d="M15.5 9.5L11 14L15.5 18.5" stroke="#1E1E1E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const CLOCK_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <circle cx="9" cy="9" r="8" stroke="#333" stroke-width="1.4"/>
  <path d="M9 5V9.5L12 11.5" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const BOX_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <rect x="1.5" y="4.5" width="15" height="12" rx="1.5" stroke="#333" stroke-width="1.4"/>
  <path d="M1.5 8h15" stroke="#333" stroke-width="1.4"/>
  <path d="M6 1.5v3M12 1.5v3" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const PIN_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4Z" stroke="#555" stroke-width="1.3"/>
  <circle cx="7" cy="5" r="1.5" stroke="#555" stroke-width="1.3"/>
</svg>`;

/// ONLY UI FIXES APPLIED — FUNCTIONALITY UNCHANGED

// ─── EMPTY CART ───────────────────────────────────────────────
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

// ─── CART ITEM ────────────────────────────────────────────────────────────────
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
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

            {/* Deliverables */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <SvgXml xml={CLOCK_ICON} width={18} height={18} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.sectionTitle}>Deliverables</Text>
                  <Text style={styles.sectionSubtitle}>
                    Shipped in {cartItems.length} package(s)
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {cartItems.map((item: any) => (
                <CartItem key={item.product?.id ?? item.product?.item_id} item={item} />
              ))}
            </View>

            {/* Bill */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <SvgXml xml={BOX_ICON} width={18} height={18} />
                <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Bill Details</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Items total</Text>
                <Text style={styles.billValue}>₹{subtotal}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery charge</Text>
                <Text style={styles.billValue}>₹{deliveryFee}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.billLabelBold}>Grand Total</Text>
                <Text style={styles.billValueBold}>₹{total}</Text>
              </View>
            </View>

            {/* Policy */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Cancellation Policy</Text>
              <View style={styles.divider} />
              <Text style={styles.policyText}>
                Once order is placed, any cancellation may result in a fine.
              </Text>
            </View>

            {/* Address */}
            <View style={[styles.card, styles.addressCard]}>
              <View style={styles.addressTopRow}>
                <View style={styles.addressRow}>
                  <SvgXml xml={PIN_ICON} width={14} height={14} />
                  <Text style={styles.addressLabel}>Home</Text>
                </View>

                <TouchableOpacity style={styles.changeBtn}>
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>
                Floor 2nd, Behind Lanakant Showroom, Pal Sawera, Gandhi Vyayam Shala, Jabalpur, M.P.
              </Text>
            </View>

            <View style={{ height: 140 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.paymentBtn}>
              <Text style={styles.paymentBtnText}>Select payment option</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
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
    paddingBottom: 160, // ensures no overlap with footer
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  sectionHeaderRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  sectionSubtitle: { fontSize: 11, color: "#888" },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 8 },

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

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  billLabel: { color: "#444" },
  billValue: { color: "#444" },
  billLabelBold: { fontWeight: "700" },
  billValueBold: { fontWeight: "700" },

  policyText: { fontSize: 12, color: "#666" },

  addressCard: {},
  addressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressRow: { flexDirection: "row", alignItems: "center" },
  addressLabel: { marginLeft: 5, fontWeight: "600" },
  addressText: { fontSize: 12, color: "#666", marginTop: 6 },

  changeBtn: {
    borderWidth: 1,
    borderColor: "#196F1B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeBtnText: {
    color: "#196F1B",
    fontSize: 12,
    fontWeight: "600",
  },

  // 🔥 FIXED FOOTER
 footer: {
  position: "absolute",
  bottom: 0, // 👈 anchor to bottom
  left: 0,
  right: 0,

  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 90, // 👈 space for tab bar

  backgroundColor: "#F2F2F2",

  // light shadow
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 5,
  elevation: 5,
},

paymentBtn: {
  backgroundColor: "#196F1B",
  height: 50,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
},

paymentBtnText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 15,
},

  // 🔥 FIXED EMPTY CART
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