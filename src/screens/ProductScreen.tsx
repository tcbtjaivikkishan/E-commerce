import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
} from "react-native";

import { PRODUCTS } from "../constants/data";
import PRODUCTS_JSON from "../data/products.json";
import type { TaxPreference } from "./CategoriesScreen";

interface ScreenProduct {
  item_id?: string;
  name: string;
  image_name?: string;
  image_document_id?: string;
  image?: string;
  rate?: number;
  label_rate?: number;
  priceRaw?: number;
  mrp?: number;
  track_inventory?: boolean;
  available_stock?: number;
  stock?: number;
  item_tax_preferences?: TaxPreference[];
  category_name?: string;
  category?: string;
  description?: string;
  sku?: string;
  weight_with_unit?: string;
  unit?: string;
  brand?: string;
  manufacturer?: string;
  hsn_or_sac?: string;
  dimensions_with_unit?: string;
  product_type?: string;
  is_returnable?: boolean;
}

const { width } = Dimensions.get("window");

// ─── Image URL helper ─────────────────────────────────────────────────────────
const getImageUrl = (product: ScreenProduct): string | null => {
  if (product.image) return product.image;
  if (!product.image_document_id || !product.image_name) return null;
  return `https://cdn2.zohoecommerce.com/product-images/${product.image_name}/${product.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
};

const findProduct = (id: string): ScreenProduct | undefined => {
  const fromList = PRODUCTS.find((item) => item.id === id);
  if (fromList) {
    return {
      item_id: fromList.id,
      name: fromList.name,
      image: fromList.image,
      rate: fromList.priceRaw,
      label_rate: fromList.mrp,
      priceRaw: fromList.priceRaw,
      mrp: fromList.mrp,
      track_inventory: true,
      available_stock: fromList.stock,
      stock: fromList.stock,
      item_tax_preferences: [],
      category_name: fromList.category,
      description: fromList.description,
      sku: fromList.sku,
      weight_with_unit: fromList.unit,
    };
  }

  const jsonItems = (PRODUCTS_JSON as { items: ScreenProduct[] }).items ?? [];
  return jsonItems.find((item) => item.item_id === id);
};

// ─── Stock Badge ──────────────────────────────────────────────────────────────
interface StockBadgeProps {
  stock: number;
  trackInventory: boolean;
}

const StockBadge: React.FC<StockBadgeProps> = ({ stock, trackInventory }) => {
  if (!trackInventory) return null;
  const inStock = stock > 0;
  return (
    <View
      style={[styles.stockBadge, inStock ? styles.inStock : styles.outOfStock]}
    >
      <View
        style={[
          styles.stockDot,
          inStock ? styles.inStockDot : styles.outOfStockDot,
        ]}
      />
      <Text
        style={[
          styles.stockText,
          inStock ? styles.inStockText : styles.outOfStockText,
        ]}
      >
        {inStock ? "In Stock" : "Out of Stock"}
      </Text>
    </View>
  );
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
interface InfoRowProps {
  icon: string;
  label: string;
  value: string | null | undefined;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionCardTitle}>{title}</Text>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProductScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id ?? "";
  const product = findProduct(productId);

  const [quantity, setQuantity] = useState<number>(1);
  const [wishlist, setWishlist] = useState<boolean>(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Text style={styles.navBtnIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Product Not Found</Text>
          <View style={styles.navRight} />
        </View>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>Unable to load this product.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl: string | null = getImageUrl(product);
  const inStock: boolean = product.track_inventory
    ? (product.available_stock ?? 0) > 0
    : true;
  const price: number = product.rate ?? product.label_rate ?? 0;
  const totalPrice: string = (price * quantity).toFixed(2);
  const taxPreferences = product.item_tax_preferences ?? [];

  const intraTax: TaxPreference | undefined = taxPreferences.find(
    (t) => t.tax_specification === "intra",
  );
  const taxPct: number = intraTax?.tax_percentage ?? 0;

  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({
        message: `Check out ${product.name} on Jaivik Mart — ₹${price}`,
        url: `https://products.tcbtjaivikkisan.com/products/${product.item_id}`,
      });
    } catch (_) {}
  };

  const handleAddToCart = (): void => {
    Alert.alert(
      "Added to Cart",
      `${quantity} × ${product.name} added to your cart.`,
    );
  };

  const handleBuyNow = (): void => {
    Alert.alert(
      "Order",
      `Proceeding to checkout for ${quantity} × ${product.name}.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Nav ── */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Text style={styles.navBtnIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Product Details
        </Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Text style={styles.navBtnIcon}>⬆</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setWishlist((w) => !w)}
          >
            <Text
              style={[styles.navBtnIcon, wishlist && styles.wishlistActive]}
            >
              {wishlist ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Product Image ── */}
        <View style={styles.imageSection}>
          <View style={styles.imageBox}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>🌿</Text>
                <Text style={styles.imagePlaceholderLabel}>No Image</Text>
              </View>
            )}
          </View>
          {product.category_name ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {product.category_name}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Product Header ── */}
        <View style={styles.productHeader}>
          <View style={styles.productTitleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <StockBadge
              stock={product.available_stock ?? 0}
              trackInventory={product.track_inventory ?? false}
            />
          </View>

          {product.brand ? (
            <Text style={styles.brandText}>by {product.brand}</Text>
          ) : product.manufacturer ? (
            <Text style={styles.brandText}>by {product.manufacturer}</Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>
              ₹{price.toLocaleString("en-IN")}
            </Text>
            {product.label_rate && product.label_rate !== price ? (
              <Text style={styles.priceMRP}>
                MRP ₹{product.label_rate.toLocaleString("en-IN")}
              </Text>
            ) : null}
            <View style={styles.taxBadge}>
              <Text style={styles.taxBadgeText}>
                {taxPct === 0 ? "0% GST" : `${taxPct}% GST`}
              </Text>
            </View>
          </View>

          {product.sku ? (
            <Text style={styles.skuText}>SKU: {product.sku}</Text>
          ) : null}
        </View>

        {/* ── Quantity Selector ── */}
        <SectionCard title="Quantity">
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <View style={styles.qtyTotal}>
              <Text style={styles.qtyTotalLabel}>Total</Text>
              <Text style={styles.qtyTotalValue}>
                ₹{parseFloat(totalPrice).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Delivery Info ── */}
        <View style={styles.deliveryBanner}>
          <Text style={styles.deliveryIcon}>🚚</Text>
          <View style={styles.deliveryTextBox}>
            <Text style={styles.deliveryTitle}>
              Estimated Delivery: 2–3 Days
            </Text>
            <Text style={styles.deliverySubtitle}>
              Free delivery on orders above ₹500
            </Text>
          </View>
        </View>

        {/* ── Description ── */}
        {product.description ? (
          <SectionCard title="About this Product">
            <Text style={styles.descText}>{product.description}</Text>
          </SectionCard>
        ) : null}

        {/* ── Product Details ── */}
        <SectionCard title="Product Details">
          <InfoRow icon="📦" label="Unit" value={product.unit} />
          <InfoRow icon="🏷️" label="HSN Code" value={product.hsn_or_sac} />
          <InfoRow icon="⚖️" label="Weight" value={product.weight_with_unit} />
          <InfoRow
            icon="📐"
            label="Dimensions"
            value={product.dimensions_with_unit}
          />
          <InfoRow
            icon="🔖"
            label="Product Type"
            value={
              product.product_type
                ? product.product_type.charAt(0).toUpperCase() +
                  product.product_type.slice(1)
                : undefined
            }
          />
          {product.track_inventory ? (
            <InfoRow
              icon="🗃️"
              label="Stock"
              value={`${product.available_stock?.toLocaleString("en-IN")} units`}
            />
          ) : null}
        </SectionCard>

        {/* ── Brand & Manufacturer ── */}
        {product.brand || product.manufacturer ? (
          <SectionCard title="Brand & Manufacturer">
            <InfoRow icon="🌿" label="Brand" value={product.brand} />
            <InfoRow
              icon="🏭"
              label="Manufacturer"
              value={product.manufacturer}
            />
          </SectionCard>
        ) : null}

        {/* ── Tax Info ── */}
        {taxPreferences.length > 0 ? (
          <SectionCard title="Tax Information">
            {taxPreferences.map((t: TaxPreference, i: number) => (
              <InfoRow
                key={i}
                icon="📋"
                label={
                  t.tax_specification === "intra"
                    ? "GST (Intra-state)"
                    : "IGST (Inter-state)"
                }
                value={`${t.tax_name} — ${t.tax_percentage}%`}
              />
            ))}
          </SectionCard>
        ) : null}

        {/* ── Return Policy ── */}
        <View style={styles.returnBanner}>
          <Text style={styles.returnIcon}>
            {product.is_returnable ? "↩️" : "⚠️"}
          </Text>
          <Text style={styles.returnText}>
            {product.is_returnable
              ? "This product is eligible for returns."
              : "This product is non-returnable once sold."}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cartBtn, !inStock && styles.ctaDisabled]}
          onPress={inStock ? handleAddToCart : undefined}
          activeOpacity={inStock ? 0.8 : 1}
        >
          <Text style={styles.cartBtnText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, !inStock && styles.ctaDisabled]}
          onPress={inStock ? handleBuyNow : undefined}
          activeOpacity={inStock ? 0.8 : 1}
        >
          <Text style={styles.buyBtnText}>
            {inStock ? "Buy Now" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F0" },

  // Top Nav
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#F5F5F0",
  },
  navBtnIcon: { fontSize: 18, color: "#333" },
  wishlistActive: { color: "#E53935" },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginHorizontal: 4,
  },
  navRight: { flexDirection: "row", gap: 4 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Image
  imageSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  imageBox: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: { width: "90%", height: "90%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontSize: 56 },
  imagePlaceholderLabel: { fontSize: 13, color: "#AAA" },
  categoryPill: {
    marginTop: 14,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  categoryPillText: { color: "#2E7D32", fontSize: 13, fontWeight: "600" },

  // Product Header
  productHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  productTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  brandText: { fontSize: 13, color: "#666", marginTop: 4, fontWeight: "500" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  priceMain: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E7D32",
    letterSpacing: -0.5,
  },
  priceMRP: {
    fontSize: 15,
    color: "#999",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },
  taxBadge: {
    backgroundColor: "#F1F8E9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#DCEDC8",
  },
  taxBadgeText: { fontSize: 11, color: "#558B2F", fontWeight: "600" },
  skuText: { fontSize: 12, color: "#AAA", marginTop: 8, fontWeight: "500" },

  // Stock Badge
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    marginTop: 2,
  },
  inStock: { backgroundColor: "#E8F5E9" },
  outOfStock: { backgroundColor: "#FFEBEE" },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  inStockDot: { backgroundColor: "#2E7D32" },
  outOfStockDot: { backgroundColor: "#C62828" },
  stockText: { fontSize: 12, fontWeight: "600" },
  inStockText: { color: "#2E7D32" },
  outOfStockText: { color: "#C62828" },

  // Quantity
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },
  qtyBtnDisabled: { backgroundColor: "#F5F5F5", borderColor: "#E0E0E0" },
  qtyBtnText: {
    fontSize: 20,
    color: "#2E7D32",
    fontWeight: "700",
    lineHeight: 24,
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    minWidth: 28,
    textAlign: "center",
  },
  qtyTotal: { marginLeft: "auto", alignItems: "flex-end" },
  qtyTotalLabel: { fontSize: 11, color: "#888", fontWeight: "500" },
  qtyTotalValue: { fontSize: 18, color: "#2E7D32", fontWeight: "800" },

  // Section Card
  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F0",
  },
  infoIcon: { fontSize: 15, width: 26 },
  infoLabel: { flex: 1, fontSize: 13, color: "#666", fontWeight: "500" },
  infoValue: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "55%",
  },

  // Delivery Banner
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1565C0",
  },
  deliveryIcon: { fontSize: 22 },
  deliveryTextBox: { flex: 1 },
  deliveryTitle: { fontSize: 13, fontWeight: "700", color: "#1565C0" },
  deliverySubtitle: { fontSize: 12, color: "#1976D2", marginTop: 1 },

  // Description
  descText: { fontSize: 14, color: "#444", lineHeight: 22 },

  // Return Banner
  returnBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#F9A825",
  },
  returnIcon: { fontSize: 18 },
  returnText: { flex: 1, fontSize: 13, color: "#E65100", fontWeight: "500" },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  cartBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
  },
  cartBtnText: { fontSize: 14, fontWeight: "700", color: "#2E7D32" },
  buyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  buyBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  ctaDisabled: { opacity: 0.45 },
});
