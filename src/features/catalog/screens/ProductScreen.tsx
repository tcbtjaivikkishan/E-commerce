import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useCart } from "../../cart/hooks/useCart";
import { fetchProductById, fetchAllProducts } from "../services/product.api";

const { width } = Dimensions.get("window");

const getImageUrl = (product: any): string => {
  if (product.image_url) return product.image_url;
  if (product.image) return product.image;
  if (product.image_document_id && product.image_name) {
    return `https://cdn2.zohoecommerce.com/product-images/${product.image_name}/${product.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
  }
  return "https://via.placeholder.com/150";
};

const getProductId = (p: any): string => p._id || p.zoho_item_id || String(p.item_id);
const getProductPrice = (p: any): number => p.price || p.rate || 0;

// ─── Quantity Stepper ───────────────────────────────────────────────────────
function QtyControl({
  qty,
  onAdd,
  onRemove,
  small = false,
}: {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  small?: boolean;
}) {
  if (qty === 0) {
    return (
      <TouchableOpacity
        style={[styles.addBtn, small && styles.addBtnSmall]}
        onPress={onAdd}
        activeOpacity={0.8}
      >
        <Text style={[styles.addBtnText, small && styles.addBtnTextSmall]}>
          ADD
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.qtyRow, small && styles.qtyRowSmall]}>
      <TouchableOpacity
        style={[styles.qtyBtn, small && styles.qtyBtnSmall]}
        onPress={onRemove}
        activeOpacity={0.8}
      >
        <Text style={[styles.qtyBtnText, small && styles.qtyBtnTextSmall]}>
          −
        </Text>
      </TouchableOpacity>
      <Text style={[styles.qtyNum, small && styles.qtyNumSmall]}>{qty}</Text>
      <TouchableOpacity
        style={[styles.qtyBtn, small && styles.qtyBtnSmall]}
        onPress={onAdd}
        activeOpacity={0.8}
      >
        <Text style={[styles.qtyBtnText, small && styles.qtyBtnTextSmall]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { add, remove, getQty } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<"500g" | "1kg">(
    "500g"
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const p = await fetchProductById(id || "");
        if (mounted) setProduct(p);

        // Fetch similar products
        try {
          const all = await fetchAllProducts();
          if (mounted) {
            setSimilarProducts(
              all.filter((item: any) => getProductId(item) !== (id || "")).slice(0, 6)
            );
          }
        } catch {}
      } catch (err: any) {
        console.warn("Failed to load product:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0F7B3C" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) return null;

  const productId = getProductId(product);
  const imageUrl = getImageUrl(product);
  const qty = getQty(productId);
  const price = getProductPrice(product);

  const handleWishlist = useCallback(() => {
    setWishlisted((prev) => !prev);
    Alert.alert(
      wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      wishlisted
        ? `${product.name} removed from your wishlist.`
        : `${product.name} saved to your wishlist!`
    );
  }, [wishlisted, product.name]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: product.name,
        message: `Check out ${product.name} on Jaivik Mart!\n\nPrice: ₹${price}\n\nShop fresh & organic products at Jaivik Mart.`,
        url: imageUrl,
      });
    } catch (e) {}
  }, [product.name, price, imageUrl]);

  const displayPrice =
    selectedVariant === "500g" ? price : Math.round(price * 1.9);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/home");
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleWishlist}
            activeOpacity={0.7}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={20}
              color={wishlisted ? "#E53935" : "#1A1A1A"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/search" as any)}
            activeOpacity={0.7}
          >
            <Feather name="search" size={20} color="#1A1A1A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Feather name="share-2" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={styles.imageContainer}>
          <View style={styles.organicBadge}>
            <MaterialIcons name="eco" size={12} color="#0F7B3C" />
            <Text style={styles.organicBadgeText}>100% Organic</Text>
          </View>

          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.name}</Text>
          </View>

          <View style={styles.priceCartRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceMain}>₹{displayPrice}</Text>
            </View>

            <QtyControl
              qty={qty}
              onAdd={() => add(productId)}
              onRemove={() => remove(productId)}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.subText}>Select Unit</Text>
          <View style={styles.variantRow}>
            {(["500g", "1kg"] as const).map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.variantBox,
                  selectedVariant === v && styles.activeVariant,
                ]}
                onPress={() => setSelectedVariant(v)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.variantText,
                    selectedVariant === v && styles.activeVariantText,
                  ]}
                >
                  {v}
                </Text>
                <Text
                  style={[
                    styles.variantPrice,
                    selectedVariant === v && styles.activeVariantPrice,
                  ]}
                >
                  ₹{v === "500g" ? price : Math.round(price * 1.9)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {similarProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Products</Text>

            <View style={styles.grid}>
              {similarProducts.map((item: any) => {
                const img = getImageUrl(item);
                const itemId = getProductId(item);
                const itemQty = getQty(itemId);

                return (
                  <TouchableOpacity
                    key={itemId}
                    style={styles.productCard}
                    onPress={() => router.push(`/product/${itemId}`)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: img }} style={styles.productImage} />

                    <Text numberOfLines={2} style={styles.productName}>
                      {item.name}
                    </Text>

                    <View style={styles.productBottom}>
                      <QtyControl
                        qty={itemQty}
                        onAdd={() => add(itemId)}
                        onRemove={() => remove(itemId)}
                        small
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomPrice}>
            ₹{displayPrice * (qty || 1)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCart, qty > 0 && styles.addToCartActive]}
          onPress={() => add(productId)}
          activeOpacity={0.85}
        >
          {qty > 0 ? (
            <QtyControl
              qty={qty}
              onAdd={() => add(productId)}
              onRemove={() => remove(productId)}
            />
          ) : (
            <Text style={styles.addText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles (UNCHANGED) ──────────────────────────────────────────────────────
const GREEN = "#0F7B3C";
const GREEN_LIGHT = "#EAF6EF";
const GREEN_BORDER = "#C4E8D1";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F4" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerRight: { flexDirection: "row", gap: 4 },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },

  imageContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    position: "relative",
  },

  organicBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GREEN_LIGHT,
    borderWidth: 1,
    borderColor: GREEN_BORDER,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  organicBadgeText: {
    fontSize: 10,
    color: GREEN,
    fontWeight: "600",
  },

  image: {
    width: width - 120,
    height: width - 120,
    resizeMode: "contain",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  titleRow: { marginBottom: 12 },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 22,
  },

  priceCartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  priceLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },

  priceMain: {
    fontSize: 22,
    fontWeight: "800",
    color: GREEN,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 14,
  },

  subText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
    fontWeight: "500",
  },

  variantRow: {
    flexDirection: "row",
    gap: 10,
  },

  variantBox: {
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 100,
    backgroundColor: "#FAFAFA",
  },

  activeVariant: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },

  variantText: {
    fontWeight: "700",
    fontSize: 13,
    color: "#333",
  },

  activeVariantText: {
    color: GREEN,
  },

  variantPrice: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },

  activeVariantPrice: {
    color: GREEN,
  },

  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 16,
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1A1A1A",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },

  productCard: {
    width: "47%",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  productImage: {
    width: "100%",
    height: 90,
    resizeMode: "contain",
    marginBottom: 6,
  },

  productName: {
    fontSize: 12,
    color: "#333",
    lineHeight: 16,
    marginBottom: 8,
  },

  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  addBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  addBtnSmall: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  addBtnText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 13,
  },

  addBtnTextSmall: {
    fontSize: 11,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 8,
    overflow: "hidden",
  },

  qtyRowSmall: {
    borderRadius: 6,
  },

  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  qtyBtnSmall: {
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  qtyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },

  qtyBtnTextSmall: {
    fontSize: 13,
    lineHeight: 16,
  },

  qtyNum: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },

  qtyNumSmall: {
    fontSize: 12,
    minWidth: 16,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },

  bottomLeft: { gap: 2 },

  bottomLabel: {
    fontSize: 11,
    color: "#999",
  },

  bottomPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },

  addToCart: {
    backgroundColor: GREEN,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
  },

  addToCartActive: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  addText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});