// src/features/catalog/screens/WishlistScreen.tsx
// ─── Wishlist screen — 3-col grid with working add-to-cart + remove ──────────
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { fetchAllProducts, getCachedProducts, type ApiProductResponse } from "../services/product.api";

const { width } = Dimensions.get("window");
const COL_GAP = 10;
const H_PAD = 16;
const COLS = 3;
const CARD_W = (width - H_PAD * 2 - COL_GAP * (COLS - 1)) / COLS;

const GREEN = "#196F1B";

// ─── Image helper (handles both string and object formats) ────────────────────
const getImageUrl = (p: any): string => {
  if (!p) return "https://via.placeholder.com/150";

  // Top-level image_url (direct field on product)
  if (p.image_url && typeof p.image_url === "string") return p.image_url;

  // image can be string or object { image_url, image_key, ... }
  if (p.image) {
    if (typeof p.image === "string") return p.image;
    if (p.image.image_url) return p.image.image_url;
  }

  // Fallback to CDN construction
  if (p.image_name && p.image_document_id) {
    return `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
  }

  return "https://via.placeholder.com/150";
};

export default function WishlistScreen() {
  const { add, remove, getQty } = useCart();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const wishlistLoading = useAppSelector(selectWishlistLoading);
  const [allProducts, setAllProducts] = useState<ApiProductResponse[]>(getCachedProducts());

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(loadWishlist());
    }
  }, [dispatch, isLoggedIn]);

  // Also fetch all products so we can enrich wishlist items if product data is missing
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (Array.isArray(data)) setAllProducts(data);
      } catch {}
    })();
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      Alert.alert(
        "Remove from Wishlist",
        "Are you sure you want to remove this item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => dispatch(removeWishlistItem(id)),
          },
        ]
      );
    },
    [dispatch]
  );


  // Map wishlist items to display-ready products
  // The backend wishlist items may have:
  //  - item.product (populated product data) OR
  //  - just item.zoho_item_id (need to look up from allProducts)
  const products = wishlistItems.map((item: any) => {
    // Try to get product data from the wishlist item itself
    let p = item.product || item;

    // If product data is missing/empty, look up from allProducts cache
    if (!p.name && !p.item_name && item.zoho_item_id) {
      const found = allProducts.find(
        (ap: any) => ap.zoho_item_id === item.zoho_item_id || ap._id === item.zoho_item_id
      );
      if (found) p = found;
    }

    const id = item.zoho_item_id || p._id || p.zoho_item_id || "";

    return {
      id,
      name: p.name || p.item_name || "Product",
      price: p.price ?? p.rate ?? 0,
      mrp: p.mrp ?? p.label_rate ?? null,
      weight:
        p.unit ||
        p.weight_unit ||
        p.weight_with_unit ||
        (p.weight ? `${p.weight} ${p.weight_unit || "kg"}` : "—"),
      image: getImageUrl(p),
    };
  });

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
              const hasDiscount = p.mrp && p.mrp > p.price;

              return (
                <TouchableOpacity
                  key={id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/product/${id}` as any)}
                >

                  {/* Remove / Heart (top-right) — filled red since it's in wishlist */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemove(id);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="heart" size={16} color="#E53935" />
                  </TouchableOpacity>

                  {/* Product Image */}
                  <Image
                    source={{ uri: p.image }}
                    style={styles.productImg}
                    resizeMode="contain"
                  />

                  {/* Product name */}
                  <Text numberOfLines={2} style={styles.name}>
                    {p.name}
                  </Text>

                  {/* Weight */}
                  <Text style={styles.weight} numberOfLines={1}>
                    {p.weight}
                  </Text>

                  {/* Price row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{p.price}</Text>
                    {hasDiscount && (
                      <Text style={styles.mrp}>₹{p.mrp}</Text>
                    )}
                  </View>

                  {/* ADD / Stepper */}
                  <View style={styles.actionRow}>
                    {qty === 0 ? (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          add(id);
                        }}
                        activeOpacity={0.8}
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

  /* Name */
  name: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    lineHeight: 14,
    marginBottom: 2,
    minHeight: 28,
  },

  /* Weight */
  weight: { fontSize: 10, color: "#888", marginBottom: 4 },

  /* Price */
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  price: { fontSize: 13, fontWeight: "700", color: "#111" },
  mrp: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 4,
  },

  /* ADD / Stepper area */
  actionRow: {
    marginTop: "auto",
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  addBtnText: { color: GREEN, fontWeight: "700", fontSize: 11 },

  /* Stepper */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GREEN,
    borderRadius: 6,
    overflow: "hidden",
  },
  stepBtn: { paddingHorizontal: 8, paddingVertical: 5 },
  stepText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepQty: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    minWidth: 16,
    textAlign: "center",
  },
});
