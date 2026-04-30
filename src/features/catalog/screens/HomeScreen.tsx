import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BannerCarousel from "../../../shared/components/BannerCarousel";
import Header from "../../../shared/components/Header";
import { useCart } from "../../cart/hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { fetchAllProducts, type ApiProductResponse } from "../services/product.api";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const [products, setProducts] = useState<ApiProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllProducts();
        if (mounted) {
          setProducts(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const bestSellers = useMemo(() => (products || []).slice(10, 20), [products]);

  // Show exactly 3 cards + a peek of the 4th
  const CARD_WIDTH = (width - 16 - 10 * 3) / 3.15;

  // Helper to get product identifier (supports both API and JSON shapes)
  const getId = useCallback((p: any) => p._id || p.zoho_item_id || p.item_id, []);

  // Helper to get image URL
  const getImage = useCallback((p: any) => {
    if (p.image_url) return p.image_url;
    // image can be a string URL or an object { image_url, image_key, ... }
    if (p.image) {
      if (typeof p.image === 'string') return p.image;
      if (p.image.image_url) return p.image.image_url;
    }
    if (p.image_name && p.image_document_id) {
      return `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
    }
    return null;
  }, []);

  // Helper to get price
  const getPrice = useCallback((p: any) => p.price || p.rate || 0, []);

  if (loading) {
    return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header
          searchPlaceholder='Search "Agnihotra"'
          onSearchPress={() => router.push("/search" as any)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#196F1B" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
    </View>
    );
  }

  if (error && products.length === 0) {
    return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header
          searchPlaceholder='Search "Agnihotra"'
          onSearchPress={() => router.push("/search" as any)}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              fetchAllProducts()
                .then((data) => setProducts(Array.isArray(data) ? data : []))
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BannerCarousel />

        {/* Recently Searched */}
        <Text style={styles.sectionTitle}>Recently Searched</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {(products || []).slice(0, 5).map((p: any) => (
            <ProductCard
              key={getId(p)}
              p={p}
              add={add}
              remove={remove}
              getQty={getQty}
              toggle={toggle}
              isWishlisted={isWishlisted}
              cardWidth={CARD_WIDTH}
              getId={getId}
              getImage={getImage}
              getPrice={getPrice}
            />
          ))}
        </ScrollView>

        {/* Best Sellers */}
        <Text style={styles.sectionTitle}>Our Bestsellers</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {bestSellers.map((p: any) => (
            <ProductCard
              key={getId(p)}
              p={p}
              add={add}
              remove={remove}
              getQty={getQty}
              toggle={toggle}
              isWishlisted={isWishlisted}
              cardWidth={CARD_WIDTH}
              getId={getId}
              getImage={getImage}
              getPrice={getPrice}
            />
          ))}
        </ScrollView>

        {/* Our Products — full vertical grid */}
        <Text style={styles.sectionTitle}>Our Products</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => getId(item)}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                p={item}
                add={add}
                remove={remove}
                getQty={getQty}
                toggle={toggle}
                isWishlisted={isWishlisted}
                cardWidth={undefined}
                getId={getId}
                getImage={getImage}
                getPrice={getPrice}
              />
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

// ─── Product Card (memoized to prevent re-renders on unrelated state changes) ─
const ProductCard = React.memo(function ProductCard({
  p,
  add,
  remove,
  getQty,
  toggle,
  isWishlisted,
  cardWidth,
  getId,
  getImage,
  getPrice,
}: any) {
  const id = getId(p);
  const image = getImage(p);
  const price = getPrice(p);

  const qty = getQty(id);
  const imgSize = cardWidth ? cardWidth - 16 : undefined;

  return (
    <TouchableOpacity
      style={[styles.card, cardWidth ? { width: cardWidth } : undefined]}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${id}` as any)}
    >
      {/* Wishlist icon */}
      <TouchableOpacity
        style={styles.wishlist}
        onPress={(e) => {
          e.stopPropagation();
          toggle(id);
        }}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Text style={styles.wishlistIcon}>
          {isWishlisted(id) ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      {/* Product Image */}
      {image ? (
        <Image
          source={{ uri: image }}
          style={[
            styles.img,
            imgSize
              ? { width: imgSize, height: imgSize * 0.9 }
              : { width: "100%", height: 80, resizeMode: "contain" },
          ]}
        />
      ) : (
        <View
          style={[
            styles.imgPlaceholder,
            imgSize
              ? { width: imgSize, height: imgSize * 0.9 }
              : { width: "100%", height: 80 },
          ]}
        />
      )}

      {/* Price */}
      <Text style={styles.price}>₹{price}</Text>

      {/* Product name */}
      <Text numberOfLines={2} style={styles.name}>
        {p.name}
      </Text>

      {/* ADD / Stepper */}
      <View style={styles.bottomArea}>
        {qty === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation();
              add(id);
            }}
          >
            <Text style={styles.addText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepTouch}
              onPress={(e) => {
                e.stopPropagation();
                remove(id);
              }}
            >
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{qty}</Text>

            <TouchableOpacity
              style={styles.stepTouch}
              onPress={(e) => {
                e.stopPropagation();
                add(id);
              }}
            >
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});


// ─── Styles ─────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    paddingBottom: 130,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 4,
  },

  // ── Loading / Error ──
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 15,
    color: "#E53935",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#196F1B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  wishlist: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 2,
  },

  wishlistIcon: {
    fontSize: 12,
  },

  img: {
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 6,
  },

  imgPlaceholder: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 6,
  },

  unit: {
    fontSize: 10,
    color: "#888",
    marginBottom: 1,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  price: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
  },

  mrp: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 4,
  },

  name: {
    fontSize: 10,
    color: "#333",
    lineHeight: 13,
    marginBottom: 6,
    minHeight: 26,
  },

  bottomArea: {
    marginTop: 4,
  },

  addBtn: {
    borderWidth: 1.5,
    borderColor: "#196F1B",
    borderRadius: 6,
    paddingVertical: 4,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  addText: {
    color: "#196F1B",
    fontWeight: "700",
    fontSize: 11,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#196F1B",
    borderRadius: 6,
    paddingHorizontal: 2,
  },

  stepTouch: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  stepText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  qty: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    minWidth: 16,
    textAlign: "center",
  },

  gridContainer: {
    paddingHorizontal: 8,
  },

  row: {
    justifyContent: "space-between",
  },

  cardWrapper: {
    flex: 1,
    margin: 4,
    maxWidth: "32%",
  },
});