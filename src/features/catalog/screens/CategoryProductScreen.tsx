import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchFilteredProducts,
  ApiProductResponse,
} from "../services/product.api";

import { useCart } from "@/src/features/cart/hooks/useCart";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 42) / 2;

// ─── Helpers ───────────────────────────────────────
const getImageUrl = (p: ApiProductResponse): string | null => {
  if (p.image?.image_url) return p.image.image_url;
  return null;
};

const getProductId = (p: any): string =>
  p._id || p.zoho_item_id || String(p.item_id);

// ─── Qty Control (same as ProductScreen) ───────────
function QtyControl({
  qty,
  onAdd,
  onRemove,
}: {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  if (qty === 0) {
    return (
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>ADD</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.qtyRow}>
      <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
        <Text style={styles.qtyBtnText}>−</Text>
      </TouchableOpacity>

      <Text style={styles.qtyNum}>{qty}</Text>

      <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
        <Text style={styles.qtyBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Product Card ──────────────────────────────────
const ProductCard: React.FC<{ item: ApiProductResponse }> = ({ item }) => {
  const { add, remove, getQty } = useCart();

  const productId = getProductId(item);
  const qty = getQty(productId);
  const imageUrl = getImageUrl(item);

  const [wishlisted, setWishlisted] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push(`/product/${productId}` as any)
      }
    >
      {/* Image */}
      <View style={styles.cardImageBox}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="leaf-outline" size={28} color="#C8A84B" />
          </View>
        )}

        {/* Wishlist */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => setWishlisted((prev) => !prev)}
        >
          <Ionicons
            name={wishlisted ? "heart" : "heart-outline"}
            size={14}
            color={wishlisted ? "#E53935" : "#0F7B3C"}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.priceMain}>₹ {item.price}</Text>

          <QtyControl
            qty={qty}
            onAdd={() => add(productId)}
            onRemove={() => remove(productId)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ───────────────────────────────────
export default function CategoryProductsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();

  const [products, setProducts] = useState<ApiProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadProducts = async (pageNumber = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);

      const res = await fetchFilteredProducts({
        page: pageNumber,
        limit: 20,
        category: String(categoryId),
      });

      setProducts((prev) =>
        append ? [...prev, ...res.data] : res.data
      );

      setTotalPages(res.totalPages);
      setTotalItems(res.total || res.data.length);
      setPage(pageNumber);
    } catch (err) {
      console.warn("Category products error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!categoryId) return;
    loadProducts(1);
  }, [categoryId]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !loadingMore) {
      loadProducts(page + 1, true);
    }
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color="#0F7B3C"
          style={{ marginTop: 60 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {String(categoryName || "Products")}
        </Text>

        <Text style={styles.count}>{totalItems}</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id || item.zoho_item_id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 14, gap: 12 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <ProductCard item={item} />}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : null
        }
      />
    </View>
  );
}

// ─── Styles (added qty styles) ─────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  backBtn: { marginRight: 10 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  count: { fontSize: 12, color: "#888" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#eee",
    overflow: "hidden",
  },
  cardImageBox: {
    backgroundColor: "#FFF8E7",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: "80%", height: "80%" },

  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#FFE9A0",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "600" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },

  priceMain: {
    fontWeight: "700",
    color: "#0F7B3C",
  },

  wishlistBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
  },

  // ✅ Qty styles
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F7B3C",
    borderRadius: 6,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  qtyNum: {
    color: "#fff",
    paddingHorizontal: 6,
  },

  addBtn: {
    borderWidth: 1,
    borderColor: "#0F7B3C",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addBtnText: {
    color: "#0F7B3C",
    fontWeight: "700",
  },
});