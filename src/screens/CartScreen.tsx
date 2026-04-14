import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
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
import { SvgXml } from "react-native-svg";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  addItem,
  clearItem,
  removeItem,
  selectCartProducts,
  selectDeliveryFee,
  selectSubtotal,
  selectTotal,
  selectTotalItems,
} from "../store/cartSlice";

const { width } = Dimensions.get("window");
const SCALE = width / 375;

// ── Icon.svg from assets/images — left arrow circle ──────────────────────────
// Figma: Arrow left-circle, 20×20, border 1.6px #1E1E1E
const BACK_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="9.2" stroke="#1E1E1E" stroke-width="1.6"/>
  <path d="M11.5 6.5L8 10L11.5 13.5" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ─── Empty Cart ───────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <View style={styles.emptyContainer}>
      {/* Cart image: 140×140 from Figma */}
      <Image
        source={require("../../assets/images/shopping-cart.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />

      <Text style={styles.emptyTitle}>Empty Cart </Text>

      <Text style={styles.emptySubtitle}>
        There are no items to show up here,{"\n"}add items to buy.
      </Text>

      {/* Button: 111×44 from Figma */}
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => router.push("/home" as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────
function CartItemRow({ item }: { item: { product: any; qty: number } }) {
  const dispatch = useAppDispatch();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { product, qty } = item;

  const pulse = () =>
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 60, useNativeDriver: true }),
    ]).start();

  return (
    <Animated.View style={[styles.cartRow, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={{ uri: product.image }} style={styles.cartImage} />

      <View style={styles.cartInfo}>
        <View style={styles.cartTopRow}>
          <Text style={styles.cartName} numberOfLines={2}>{product.name}</Text>
          <TouchableOpacity onPress={() => dispatch(clearItem(product.id))}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cartBottomRow}>
          <Text style={styles.cartPrice}>₹{product.priceRaw * qty}</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => { pulse(); dispatch(removeItem(product.id)); }}>
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepQty}>{qty}</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => { pulse(); dispatch(addItem(product.id)); }}>
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CartScreen() {
  const cartItems   = useAppSelector(selectCartProducts);
  const subtotal    = useAppSelector(selectSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total       = useAppSelector(selectTotal);
  const totalItems  = useAppSelector(selectTotalItems);

  const isEmpty = cartItems.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header: white 375×63, Figma drop shadow ── */}
      <View style={styles.header}>

        {/* Icon.svg — back arrow circle, navigates to home */}
        <TouchableOpacity
          onPress={() => router.push("/home" as any)}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <SvgXml xml={BACK_ICON_SVG} width={20} height={20} />
        </TouchableOpacity>

        {/* "Checkout" — Poppins Medium 14px, truly centered */}
        <Text style={styles.headerTitle}>Checkout</Text>

        {/* Right spacer = same width as back button for true centering */}
        <View style={styles.headerSpacer} />
      </View>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </ScrollView>

          {/* ── Checkout Footer ── */}
          <View style={styles.checkoutFooter}>
            <View>
              <Text style={styles.footerTotal}>₹{total}</Text>
              <Text style={styles.footerItems}>
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push("/checkout/address" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Figma: white header, 375×63, drop shadow Y3 blur12 spread1 25%
  header: {
    width: "100%",
    height: Math.round(63 * SCALE),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },

  // Back button touchable area
  backBtn: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // "Checkout": Poppins Medium 14px, letterSpacing -0.5, centered
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.5,
    fontFamily: "Poppins_500Medium",
  },

  // Spacer matches back button width for true centering
  headerSpacer: {
    width: 20,
  },

  // ── Empty Cart ──
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },

  // Figma: 140×140
  emptyImage: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    fontFamily: "Poppins_700Bold",
  },

  // Figma: 172×26
  emptySubtitle: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    fontFamily: "Poppins_400Regular",
  },

  // Figma: 111×44, padding 10
  shopBtn: {
    width: 111,
    height: 44,
    backgroundColor: "#196F1B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  shopBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },

  // ── Cart items ──
  scrollContent: {
    padding: 12,
    paddingBottom: 90,
  },

  cartRow: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 1,
  },

  cartImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  cartInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },

  cartTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cartName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },

  removeBtn: {
    fontSize: 14,
    color: "#999",
  },

  cartBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cartPrice: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111",
  },

  stepper: {
    flexDirection: "row",
    backgroundColor: "#196F1B",
    borderRadius: 10,
    alignItems: "center",
  },

  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  stepText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  stepQty: {
    color: "#fff",
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },

  // ── Checkout footer ──
  checkoutFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  footerTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  footerItems: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  checkoutBtn: {
    backgroundColor: "#196F1B",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },

  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
