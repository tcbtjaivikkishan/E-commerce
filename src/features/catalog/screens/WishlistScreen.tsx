// src/features/catalog/screens/WishlistScreen.tsx
// ─── Matches Figma screen_10: 3-col grid, checkbox, heart, ADD, weight, price ──
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { useCart } from "../../cart/hooks/useCart";
import {
  loadWishlist,
  removeWishlistItem,
  selectWishlistItems,
  selectWishlistLoading,
} from "../store/wishlistSlice";

const { width } = Dimensions.get("window");
const COL_GAP = 10;
const H_PAD = 16;
const COLS = 3;
const CARD_W = (width - H_PAD * 2 - COL_GAP * (COLS - 1)) / COLS;

const GREEN = "#196F1B";

// ─── Image helper ─────────────────────────────────────────────────────────────
const getImage = (p: any) =>
  p?.image_url ||
  p?.image ||
  (p?.image_name && p?.image_document_id
    ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
    : "https://via.placeholder.com/150");

export default function WishlistScreen() {
  const { add, remove, getQty } = useCart();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const wishlistLoading = useAppSelector(selectWishlistLoading);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(loadWishlist());
    }
  }, [dispatch, isLoggedIn]);

  const handleRemove = useCallback(
    (id: string) => {
      dispatch(removeWishlistItem(id));
    },
    [dispatch]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Build displayable products from API wishlist items
  const products = wishlistItems.map((item) => ({
    id: item.zoho_item_id,
    name: item.product?.name || "Unknown Product",
    price: item.product?.price || 0,
    mrp: item.product?.mrp || null,
    weight: item.product?.unit || item.product?.weight_with_unit || "350 g",
    image: item.product?.image_url || null,
    ...item.product,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.push("/home" as any);
            }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* States */}
        {!isLoggedIn ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>Login to see your wishlist</Text>
            <Text style={styles.emptySubtitle}>
              Sign in to save and view your favourite products
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push("/auth/login" as any)}
            >
              <Text style={styles.browseBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : wishlistLoading && products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={[styles.emptySubtitle, { marginTop: 12 }]}>
              Loading wishlist...
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💚</Text>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on products to add them here
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push("/home" as any)}
            >
              <Text style={styles.browseBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {products.map((p) => {
              const id = p.id;
              const qty = getQty(id);
              const isSelected = selected.has(id);

              return (
                <TouchableOpacity
                  key={id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/product/${id}` as any)}
                >
                  {/* Checkbox (top-left) */}
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleSelect(id);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        isSelected && styles.checkboxBoxChecked,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Heart (top-right) */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemove(id);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="heart-outline" size={16} color="#999" />
                  </TouchableOpacity>

                  {/* Product Image */}
                  <Image
                    source={{ uri: getImage(p) }}
                    style={styles.productImg}
                    resizeMode="contain"
                  />

                  {/* Weight + ADD row */}
                  <View style={styles.weightAddRow}>
                    <Text style={styles.weight}>{p.weight}</Text>
                    {qty === 0 ? (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          add(id);
                        }}
                      >
                        <Text style={styles.addBtnText}>ADD</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            remove(id);
                          }}
                          style={styles.stepBtn}
                        >
                          <Text style={styles.stepText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepQty}>{qty}</Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            add(id);
                          }}
                          style={styles.stepBtn}
                        >
                          <Text style={styles.stepText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Price row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{p.price || 0}</Text>
                    {p.mrp && p.mrp > (p.price || 0) && (
                      <Text style={styles.mrp}>₹{p.mrp}</Text>
                    )}
                  </View>

                  {/* Product name */}
                  <Text numberOfLines={2} style={styles.name}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  /* Empty state */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: GREEN,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  browseBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 40,
    gap: COL_GAP,
  },

  /* Card */
  card: {
    width: CARD_W,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 8,
    marginBottom: 2,
    position: "relative",
  },

  /* Checkbox */
  checkbox: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 2,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#CCC",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  /* Heart */
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
  },

  /* Product image */
  productImg: {
    width: CARD_W - 16,
    height: CARD_W - 16,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },

  /* Weight + ADD row */
  weightAddRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 4,
  },
  weight: { fontSize: 11, color: "#666", fontWeight: "500" },
  addBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  addBtnText: { color: GREEN, fontWeight: "700", fontSize: 11 },

  /* Stepper */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 6,
    overflow: "hidden",
  },
  stepBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  stepText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepQty: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    minWidth: 14,
    textAlign: "center",
  },

  /* Price */
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  price: { fontSize: 12, fontWeight: "700", color: "#111" },
  mrp: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 4,
  },

  /* Name */
  name: { fontSize: 10, color: "#333", lineHeight: 13 },
});
