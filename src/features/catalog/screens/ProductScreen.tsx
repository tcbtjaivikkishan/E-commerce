import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useCart } from "../../cart/hooks/useCart";
import VariantPickerModal from "../components/VariantPickerModal";
import { fetchProductById, fetchAllProducts } from "../services/product.api";
import {
  getProductVariants,
  getVariantCartSummary,
  hasProductVariants,
  getProductUnit,
} from "../utils/productVariants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");


// ─── Description Section Renderer ────────────────────────────────────────────
function DescriptionRenderer({ description }: { description: string | undefined | null }) {
  if (!description || !description.trim()) {
    return (
      <View style={descStyles.container}>
        <Text style={descStyles.noDetails}>No details available for this product.</Text>
      </View>
    );
  }

  const text = description.trim();

  // Extract content inside [...]
  const bracketMatch = text.match(/\[([^\]]+)\]/s);
  const shortDesc = bracketMatch ? bracketMatch[1].trim() : "";

  // Everything outside the [...] block
  let longDesc = bracketMatch ? text.replace(/\[[^\]]*\]/s, "").trim() : text;

  // Parse long description into structured sections
  const renderLongDesc = (rawText: string) => {
    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      // Section header — ends with ':'
      if (line.endsWith(":") || line.endsWith("：")) {
        elements.push(
          <Text key={i} style={descStyles.sectionHeader}>
            {line.replace(/:$|：$/, "")}
          </Text>
        );
      }
      // Key-value line — has a pattern like "label- value" or "label: value" (short label)
      else if (/^.{2,25}[-–]\s/.test(line)) {
        const dashIdx = line.search(/[-–]\s/);
        const label = line.substring(0, dashIdx).trim();
        const value = line.substring(dashIdx + 1).trim();
        elements.push(
          <View key={i} style={descStyles.keyValueRow}>
            <Text style={descStyles.keyText}>{label}:</Text>
            <Text style={descStyles.valueText}> {value}</Text>
          </View>
        );
      }
      // Regular line → bullet point
      else {
        elements.push(
          <View key={i} style={descStyles.bulletRow}>
            <View style={descStyles.bulletDot} />
            <Text style={descStyles.bulletText}>{line}</Text>
          </View>
        );
      }
    });

    return elements;
  };

  return (
    <View style={descStyles.container}>
      {/* Short Description */}
      {shortDesc ? (
        <View style={descStyles.shortDescCard}>
          <Text style={descStyles.shortDescText}>{shortDesc}</Text>
        </View>
      ) : null}

      {/* Long Description */}
      {longDesc ? (
        <View style={descStyles.longDescWrap}>
          {renderLongDesc(longDesc)}
        </View>
      ) : null}

      {/* Fallback: if both are empty after parsing, show raw text */}
      {!shortDesc && !longDesc ? (
        <Text style={descStyles.fallbackText}>{text}</Text>
      ) : null}
    </View>
  );
}

const descStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  noDetails: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  // Short description card
  shortDescCard: {
    backgroundColor: "#F0FAF4",
    borderLeftWidth: 3,
    borderLeftColor: "#0F7B3C",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  shortDescText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    fontWeight: "500",
  },
  // Long description
  longDescWrap: {
    gap: 6,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 10,
    marginBottom: 4,
  },
  keyValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
    gap: 6,
  },
  keyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#444",
  },
  valueText: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 4,
    marginBottom: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#0F7B3C",
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    flex: 1,
  },
  fallbackText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
});

const getImageUrl = (product: any): string => {
  if (product.image_url) return product.image_url;
  if (product.image) {
    if (typeof product.image === "string") return product.image;
    if (product.image.image_url) return product.image.image_url;
  }
  if (product.image_document_id && product.image_name) {
    return `https://cdn2.zohoecommerce.com/product-images/${product.image_name}/${product.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
  }
  return "https://via.placeholder.com/150";
};

const getProductId = (p: any): string =>
  p._id || p.zoho_item_id || String(p.item_id);
const getProductPrice = (p: any): number => p.price || p.rate || 0;
const getProductMrp = (p: any): number => p.mrp || p.compare_at_price || 0;

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { add, remove, getQty } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [variantProduct, setVariantProduct] = useState<any | null>(null);

  // Animated rotation for details chevron
  const detailsAnim = useRef(new Animated.Value(1)).current;

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
              all
                .filter((item: any) => getProductId(item) !== (id || ""))
                .slice(0, 6)
            );
          }
        } catch {}
      } catch (err: any) {
        console.warn("Failed to load product:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleWishlist = useCallback(() => {
    setWishlisted((prev) => !prev);
    Alert.alert(
      wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      wishlisted
        ? `${product?.name} removed from your wishlist.`
        : `${product?.name} saved to your wishlist!`
    );
  }, [wishlisted, product?.name]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: product?.name,
        message: `Check out ${product?.name} on TCBT Mart!\n\nPrice: ₹${product?.price || 0}\n\nShop fresh & organic products at TCBT Mart.`,
        url: getImageUrl(product),
      });
    } catch (e) {}
  }, [product]);

  const toggleDetails = useCallback(() => {
    const toValue = showDetails ? 0 : 1;
    Animated.timing(detailsAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowDetails((prev) => !prev);
  }, [showDetails, detailsAnim]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) return null;

  const productId = getProductId(product);
  const imageUrl = getImageUrl(product);
  const price = getProductPrice(product);
  const mrp = getProductMrp(product);
  const variants = getProductVariants(product);
  const hasVariants = variants.length > 1;
  const variantCart = hasVariants
    ? getVariantCartSummary(product, getQty)
    : null;
  const qty = hasVariants
    ? variantCart?.totalQty ?? 0
    : getQty(productId);

  // Selected variant info for bottom bar
  const selectedVariant = hasVariants ? variants[selectedVariantIndex] : null;
  const displayUnit = selectedVariant
    ? selectedVariant.unit
    : getProductUnit(product) || "";
  const displayPrice = selectedVariant ? selectedVariant.price : price;
  const displayMrp = selectedVariant
    ? (selectedVariant.raw?.mrp || selectedVariant.raw?.compare_at_price || mrp)
    : mrp;

  const openVariantPicker = (item: any) => {
    if (hasProductVariants(item)) {
      setVariantProduct(item);
      return true;
    }
    return false;
  };

  const chevronRotation = detailsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.container}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
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

          <View style={{ flex: 1 }} />

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
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
              style={styles.headerIconBtn}
              onPress={() => router.push("/search" as any)}
              activeOpacity={0.7}
            >
              <Feather name="search" size={20} color="#1A1A1A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Feather name="share" size={20} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* ─── Product Image ─── */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>

          {/* ─── Product Info Card ─── */}
          <View style={styles.infoCard}>
            <Text style={styles.productName}>{product.name}</Text>

            {/* Select Unit */}
            {hasVariants && (
              <>
                <Text style={styles.selectUnitLabel}>Select Unit</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.variantRow}
                >
                  {variants.map((variant, index) => {
                    const isSelected = selectedVariantIndex === index;
                    const variantMrp =
                      variant.raw?.mrp ||
                      variant.raw?.compare_at_price ||
                      mrp;
                    return (
                      <TouchableOpacity
                        key={variant.id}
                        style={[
                          styles.variantBox,
                          isSelected && styles.variantBoxActive,
                        ]}
                        onPress={() => setSelectedVariantIndex(index)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.variantUnitText,
                            isSelected && styles.variantUnitTextActive,
                          ]}
                        >
                          {variant.unit || variant.name}
                        </Text>
                        <View style={styles.variantPriceRow}>
                          <Text
                            style={[
                              styles.variantPriceText,
                              isSelected && styles.variantPriceTextActive,
                            ]}
                          >
                            ₹{variant.price}
                          </Text>
                          {variantMrp > 0 && variantMrp > variant.price && (
                            <Text style={styles.variantMrpText}>
                              MRP ₹{variantMrp}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Single variant / no variants — show price inline */}
            {!hasVariants && (
              <>
                <Text style={styles.selectUnitLabel}>Select Unit</Text>
                <View style={styles.variantRow}>
                  <View style={[styles.variantBox, styles.variantBoxActive]}>
                    <Text
                      style={[
                        styles.variantUnitText,
                        styles.variantUnitTextActive,
                      ]}
                    >
                      {displayUnit || "Standard"}
                    </Text>
                    <View style={styles.variantPriceRow}>
                      <Text
                        style={[
                          styles.variantPriceText,
                          styles.variantPriceTextActive,
                        ]}
                      >
                        ₹{price}
                      </Text>
                      {mrp > 0 && mrp > price && (
                        <Text style={styles.variantMrpText}>
                          MRP ₹{mrp}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* ─── Details Section ─── */}
          <TouchableOpacity
            style={styles.detailsSection}
            onPress={toggleDetails}
            activeOpacity={0.7}
          >
            <View style={styles.detailsHeader}>
              <Animated.View
                style={{ transform: [{ rotate: chevronRotation }] }}
              >
                <Ionicons
                  name="chevron-down-circle-outline"
                  size={22}
                  color="#555"
                />
              </Animated.View>
              <Text style={styles.detailsTitle}>Details</Text>
            </View>
          </TouchableOpacity>
          {showDetails && (
            <DescriptionRenderer description={product.description} />
          )}

          {/* ─── Similar Products ─── */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>Similar Products</Text>

              <FlatList
                data={similarProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => getProductId(item)}
                contentContainerStyle={styles.similarList}
                renderItem={({ item }) => {
                  const img = getImageUrl(item);
                  const itemId = getProductId(item);
                  const itemPrice = getProductPrice(item);
                  const itemMrp = getProductMrp(item);
                  const itemVariantCount = getProductVariants(item).length;
                  const itemHasVariants = itemVariantCount > 1;
                  const itemVariantCart = itemHasVariants
                    ? getVariantCartSummary(item, getQty)
                    : null;
                  const itemQty = itemHasVariants
                    ? itemVariantCart?.totalQty ?? 0
                    : getQty(itemId);

                  return (
                    <TouchableOpacity
                      style={styles.similarCard}
                      onPress={() => router.push(`/product/${itemId}`)}
                      activeOpacity={0.85}
                    >
                      {/* Product image */}
                      <View style={styles.similarImageWrap}>
                        <Image
                          source={{ uri: img }}
                          style={styles.similarImage}
                          resizeMode="contain"
                        />

                        {/* ADD button overlay */}
                        {itemQty === 0 ? (
                          <TouchableOpacity
                            style={styles.similarAddBtn}
                            onPress={(e) => {
                              e.stopPropagation();
                              if (!openVariantPicker(item)) add(itemId);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.similarAddBtnText}>ADD</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.similarStepperWrap}>
                            <View style={styles.similarStepper}>
                              <TouchableOpacity
                                style={styles.similarStepBtn}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  remove(
                                    itemHasVariants &&
                                      itemVariantCart?.firstCartId
                                      ? itemVariantCart.firstCartId
                                      : itemId
                                  );
                                }}
                              >
                                <Text style={styles.similarStepText}>−</Text>
                              </TouchableOpacity>
                              <Text style={styles.similarStepQty}>
                                {itemQty}
                              </Text>
                              <TouchableOpacity
                                style={styles.similarStepBtn}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  if (!openVariantPicker(item)) add(itemId);
                                }}
                              >
                                <Text style={styles.similarStepText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Price row */}
                      <View style={styles.similarPriceRow}>
                        <Text style={styles.similarPrice}>₹{itemPrice}</Text>
                        {itemMrp > 0 && itemMrp > itemPrice && (
                          <Text style={styles.similarMrp}>₹{itemMrp}</Text>
                        )}
                      </View>

                      {/* Product name */}
                      <Text numberOfLines={2} style={styles.similarName}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </ScrollView>

        {/* ─── Bottom Bar ─── */}
        {hasVariants ? (
          <View style={styles.bottomBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bottomVariantRow}
            >
              {variants.map((variant, index) => {
                const vQty = getQty(variant.cartId);
                const isSelected = selectedVariantIndex === index;
                return (
                  <View
                    key={variant.id}
                    style={[
                      styles.bottomVariantCard,
                      isSelected && styles.bottomVariantCardActive,
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedVariantIndex(index)}
                      style={styles.bottomVariantInfo}
                    >
                      <Text
                        style={[
                          styles.bottomVariantUnit,
                          isSelected && styles.bottomVariantUnitActive,
                        ]}
                      >
                        {variant.unit || variant.name}
                      </Text>
                      <Text
                        style={[
                          styles.bottomVariantPrice,
                          isSelected && styles.bottomVariantPriceActive,
                        ]}
                      >
                        ₹{variant.price}
                      </Text>
                    </TouchableOpacity>

                    {vQty > 0 ? (
                      <View style={styles.bottomVariantStepper}>
                        <TouchableOpacity
                          style={styles.bottomVariantStepBtn}
                          onPress={() => remove(variant.cartId)}
                        >
                          <Text style={styles.bottomVariantStepText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.bottomVariantStepQty}>{vQty}</Text>
                        <TouchableOpacity
                          style={styles.bottomVariantStepBtn}
                          onPress={() => add(variant.cartId)}
                        >
                          <Text style={styles.bottomVariantStepText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.bottomVariantAddBtn}
                        onPress={() => {
                          setSelectedVariantIndex(index);
                          add(variant.cartId);
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="add" size={18} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.bottomBar}>
            <View style={styles.bottomLeft}>
              <Text style={styles.bottomUnit}>{displayUnit || "Standard"}</Text>
              <Text style={styles.bottomPrice}>₹{displayPrice}</Text>
              <Text style={styles.bottomTaxNote}>inclusive of all taxes</Text>
            </View>

            <TouchableOpacity
              style={styles.bottomCartBtn}
              onPress={() => {
                if (!openVariantPicker(product)) add(productId);
              }}
              activeOpacity={0.85}
            >
              {qty > 0 ? (
                <View style={styles.bottomStepperRow}>
                  <TouchableOpacity
                    style={styles.bottomStepBtn}
                    onPress={() => remove(productId)}
                  >
                    <Text style={styles.bottomStepText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.bottomStepQty}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.bottomStepBtn}
                    onPress={() => add(productId)}
                  >
                    <Text style={styles.bottomStepText}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.bottomCartInner}>
                  <MaterialIcons name="add-shopping-cart" size={22} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <VariantPickerModal
          visible={!!variantProduct}
          product={variantProduct}
          getQty={getQty}
          onAdd={add}
          onRemove={remove}
          onClose={() => setVariantProduct(null)}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const GREEN = "#0F7B3C";
const GREEN_LIGHT = "#EAF6EF";
const GREEN_BORDER = "#C4E8D1";
const DARK_GREEN = "#1B5E20";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 6,
  },

  // ── Product Image ──────────────────────────────────────────────────────────
  imageSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 30,
    minHeight: SCREEN_WIDTH * 0.7,
  },
  productImage: {
    width: SCREEN_WIDTH - 100,
    height: SCREEN_WIDTH - 100,
  },

  // ── Info Card ──────────────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 22,
    marginBottom: 8,
  },
  selectUnitLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginBottom: 10,
  },

  // ── Variant Boxes ──────────────────────────────────────────────────────────
  variantRow: {
    flexDirection: "row",
    gap: 10,
  },
  variantBox: {
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 100,
    backgroundColor: "#fff",
  },
  variantBoxActive: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  variantUnitText: {
    fontWeight: "700",
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  variantUnitTextActive: {
    color: "#1A1A1A",
  },
  variantPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  variantPriceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },
  variantPriceTextActive: {
    color: "#1A1A1A",
  },
  variantMrpText: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },

  // ── Details Section ────────────────────────────────────────────────────────
  detailsSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  // detailsContent and detailsText moved to DescriptionRenderer (descStyles)

  // ── Similar Products ───────────────────────────────────────────────────────
  similarSection: {
    backgroundColor: "#fff",
    marginTop: 8,
    paddingTop: 16,
    paddingBottom: 12,
  },
  similarTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  similarList: {
    paddingHorizontal: 12,
    gap: 10,
  },
  similarCard: {
    width: 130,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  similarImageWrap: {
    height: 120,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 12,
    margin: 6,
  },
  similarImage: {
    width: "80%",
    height: "80%",
  },
  similarAddBtn: {
    position: "absolute",
    bottom: -12,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  similarAddBtnText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  similarStepperWrap: {
    position: "absolute",
    bottom: -12,
    alignSelf: "center",
  },
  similarStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 6,
    overflow: "hidden",
  },
  similarStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  similarStepText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  similarStepQty: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    minWidth: 16,
    textAlign: "center",
  },
  similarPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  similarPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  similarMrp: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },
  similarName: {
    fontSize: 11,
    color: "#555",
    lineHeight: 15,
    paddingHorizontal: 8,
    paddingBottom: 10,
    marginTop: 2,
  },

  // ── Bottom Bar ─────────────────────────────────────────────────────────────
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomUnit: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
    marginBottom: 1,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  bottomTaxNote: {
    fontSize: 10,
    color: "#999",
    marginTop: 1,
  },
  bottomCartBtn: {
    backgroundColor: DARK_GREEN,
    borderRadius: 10,
    minWidth: 54,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  bottomCartInner: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomStepperRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomStepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bottomStepText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  bottomStepQty: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },

  // ── Bottom Bar — Per-Variant Layout ────────────────────────────────────────
  bottomVariantRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 4,
  },
  bottomVariantCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    backgroundColor: "#FAFAFA",
    minWidth: 140,
    gap: 8,
  },
  bottomVariantCardActive: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  bottomVariantInfo: {
    flex: 1,
  },
  bottomVariantUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
    marginBottom: 1,
  },
  bottomVariantUnitActive: {
    color: "#1A1A1A",
  },
  bottomVariantPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
  },
  bottomVariantPriceActive: {
    color: DARK_GREEN,
  },
  bottomVariantStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_GREEN,
    borderRadius: 8,
    overflow: "hidden",
  },
  bottomVariantStepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bottomVariantStepText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  bottomVariantStepQty: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    minWidth: 18,
    textAlign: "center",
  },
  bottomVariantAddBtn: {
    backgroundColor: DARK_GREEN,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

