import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCart } from "../../cart/hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import {
  fetchAllProducts,
  getCachedProducts,
  type ApiProductResponse,
} from "../services/product.api";

const normalizeSearchText = (value: unknown) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const matchesSearchTerm = (product: ApiProductResponse, query: string) => {
  const queryWords = normalizeSearchText(query).split(" ").filter(Boolean);
  if (queryWords.length === 0) return false;

  const searchableText = normalizeSearchText(product.name);
  const searchableWords = searchableText.split(" ").filter(Boolean);

  return queryWords.every((queryWord) =>
    searchableWords.some((word) => word.startsWith(queryWord))
  );
};

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const cachedProducts = getCachedProducts();
  const hasCachedProducts = cachedProducts.length > 0;
  const [products, setProducts] = useState<ApiProductResponse[]>(cachedProducts);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!hasCachedProducts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!hasCachedProducts) setLoading(true);
        const data = await fetchAllProducts();
        if (mounted) {
          setProducts(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [hasCachedProducts]);

  const getId = useCallback((p: any) => p._id || p.zoho_item_id || String(p.item_id), []);

  const getImage = useCallback((p: any) => {
    if (p.image_url) return p.image_url;
    if (p.image) return p.image;
    if (p.image_name && p.image_document_id) {
      return `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
    }
    return null;
  }, []);

  const getPrice = useCallback((p: any) => p.price || p.rate || 0, []);

  const results = useMemo(() => {
    return products.filter((product) => matchesSearchTerm(product, query));
  }, [products, query]);

  const showEmpty = !loading && query.trim().length > 0 && results.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Keyboard.dismiss();
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/home" as any);
            }
          }}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder='Search "Agnihotra"'
            placeholderTextColor="#999"
            style={styles.input}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#196F1B" />
          <Text style={styles.stateText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : query.trim().length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="search-outline" size={32} color="#196F1B" />
          <Text style={styles.stateTitle}>Search products</Text>
          <Text style={styles.stateText}>Type a product name to see matching items.</Text>
        </View>
      ) : showEmpty ? (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>No products found</Text>
          <Text style={styles.stateText}>Try another product name.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => getId(item)}
          numColumns={3}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {`${results.length} result${results.length === 1 ? "" : "s"} for "${query.trim()}"`}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <SearchProductCard
                product={item}
                add={add}
                remove={remove}
                getQty={getQty}
                toggle={toggle}
                isWishlisted={isWishlisted}
                getId={getId}
                getImage={getImage}
                getPrice={getPrice}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function SearchProductCard({
  product,
  add,
  remove,
  getQty,
  toggle,
  isWishlisted,
  getId,
  getImage,
  getPrice,
}: any) {
  const id = getId(product);
  const image = getImage(product);
  const price = getPrice(product);
  const qty = getQty(id);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${id}` as any)}
    >
      <TouchableOpacity
        style={styles.wishlist}
        onPress={(e) => {
          e.stopPropagation();
          toggle(id);
        }}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Ionicons
          name={isWishlisted(id) ? "heart" : "heart-outline"}
          size={15}
          color={isWishlisted(id) ? "#E53935" : "#777"}
        />
      </TouchableOpacity>

      {image ? (
        <Image source={{ uri: image }} style={styles.img} />
      ) : (
        <View style={styles.imgPlaceholder} />
      )}

      <Text style={styles.price}>{"\u20B9"}{price}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

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
              <Text style={styles.stepText}>-</Text>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F3",
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#111",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  stateText: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#E53935",
    textAlign: "center",
  },
  resultCount: {
    width: "100%",
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 130,
  },
  row: {
    justifyContent: "flex-start",
  },
  cardWrapper: {
    margin: 6,
    width: "30.9%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 6,
  },
  imgPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 6,
  },
  price: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
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
});
