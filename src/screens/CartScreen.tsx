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
  clearItem,
  removeItem,
  selectCartProducts,
  selectDeliveryFee,
  selectSubtotal,
  selectTotal,
  selectTotalItems,
} from "../store/cartSlice";

// ✅ SAME DATA SOURCE AS CATEGORY
const PRODUCTS_MAP: Record<string, any> = {};
((PRODUCTS_JSON as any).items || []).forEach((p: any) => {
  PRODUCTS_MAP[p.item_id] = p;
});

// ✅ IMAGE HELPER (same as product screen)
const getImage = (p: any) =>
  p?.image ||
  (p?.image_name && p?.image_document_id
    ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
    : "https://via.placeholder.com/150");

const BACK_ICON = `<svg width="20" height="20" viewBox="0 0 20 20">
<circle cx="10" cy="10" r="9" stroke="#1E1E1E" stroke-width="1.5"/>
<path d="M11.5 6.5L8 10L11.5 13.5" stroke="#1E1E1E" stroke-width="1.5"/>
</svg>`;

// ─── EMPTY CART ───
function EmptyCart() {
  return (
    <View style={styles.emptyContainer}>
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
  );
}

// ─── CART ITEM ───
function CartItem({ item }: any) {
  const dispatch = useAppDispatch();
  const scale = useRef(new Animated.Value(1)).current;

  const product = PRODUCTS_MAP[item.product.id];
  if (!product) return null;

  const qty = item.qty;
  const price = product.rate ?? 0;

  const pulse = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();

  return (
    <Animated.View style={[styles.row, { transform: [{ scale }] }]}>
      <Image source={{ uri: getImage(product) }} style={styles.image} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{price}</Text>
      </View>

      <View style={styles.stepper}>
        <TouchableOpacity
          onPress={() => {
            pulse();
            dispatch(removeItem(product.item_id));
          }}
        >
          <Text style={styles.stepText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.qty}>{qty}</Text>

        <TouchableOpacity
          onPress={() => {
            pulse();
            dispatch(addItem(product.item_id));
          }}
        >
          <Text style={styles.stepText}>+</Text>
        </TouchableOpacity>
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
  const totalItems = useAppSelector(selectTotalItems);

  const isEmpty = cartItems.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/home" as any)}>
          <SvgXml xml={BACK_ICON} width={20} height={20} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 20 }} />
      </View>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            
            {/* DELIVERABLES */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Deliverables</Text>

              {cartItems.map((item: any) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </View>

            {/* BILL */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Bill Details</Text>

              <View style={styles.billRow}>
                <Text>Items total</Text>
                <Text>₹{subtotal}</Text>
              </View>

              <View style={styles.billRow}>
                <Text>Delivery charge</Text>
                <Text>₹{deliveryFee}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={{ fontWeight: "700" }}>Grand Total</Text>
                <Text style={{ fontWeight: "700" }}>₹{total}</Text>
              </View>
            </View>

            {/* POLICY */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Cancellation Policy</Text>
              <Text style={styles.policy}>
                Once order is placed, cancellation may result in a fine.
                Refunds provided in case of delay.
              </Text>
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={{ fontWeight: "700" }}>
              ₹{total} • {totalItems} items
            </Text>

            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Checkout →
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerTitle: { fontSize: 16, fontWeight: "600" },

  empty: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  sectionTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  image: { width: 60, height: 60, marginRight: 10 },

  name: { fontSize: 13, fontWeight: "600" },

  price: { fontSize: 12, color: "#555" },

  stepper: {
    flexDirection: "row",
    backgroundColor: "#196F1B",
    borderRadius: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  stepText: { color: "#fff", fontSize: 16, paddingHorizontal: 6 },

  qty: { color: "#fff", fontWeight: "700" },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  policy: { fontSize: 12, color: "#777" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  checkoutBtn: {
    backgroundColor: "#196F1B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
},

emptyImage: {
  width: 140,
  height: 140,
  marginBottom: 20,
},

emptyTitle: {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 8,
},

emptySubtitle: {
  fontSize: 13,
  color: "#777",
  textAlign: "center",
  marginBottom: 28,
},

shopBtn: {
  backgroundColor: "#196F1B",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 10,
},

shopBtnText: {
  color: "#fff",
  fontWeight: "700",
},
});