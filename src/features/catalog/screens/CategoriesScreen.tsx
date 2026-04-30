import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

import Header from "../../../shared/components/Header";
import { fetchAllCategories } from "../services/category.api";
import { fetchAllProducts } from "../services/product.api";

// ─── Types ─────────────────────────────────────────

interface CategoryItem {
  id: string;
  item_id: string;
  name: string;
  image: string | null;
}

interface Category {
  id: string;
  title: string;
  items: CategoryItem[];
  totalItems: number;
}

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 4;

// ─── Helpers ───────────────────────────────────────

const getImageUrl = (p: any): string | null => {
  if (p.image_url) return p.image_url;
  if (p.image) return p.image;
  if (p.image_document_id && p.image_name) {
    return `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`;
  }
  return null;
};

// ─── Product Card (memoized) ──────────────────────────────────
const ProductCard = React.memo<{
  item: CategoryItem;
  onPress: (item: CategoryItem) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.75}
  >
    <View style={styles.cardImageBox}>
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.cardImagePlaceholder} />
      )}
    </View>
    <Text style={styles.cardLabel} numberOfLines={2}>
      {item.name}
    </Text>
  </TouchableOpacity>
));

// ─── Category Section (memoized) ────────────────────────
const CategorySection = React.memo<{
  category: Category;
  onProductPress: (item: CategoryItem) => void;
}>(({ category, onProductPress }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{category.title}</Text>

      {/* ✅ Show only if more items exist */}
      {category.totalItems > 8 && (
        <TouchableOpacity
          onPress={() =>
            router.push(`/category/${category.id}` as any)
          }
        >
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>

    <View style={styles.grid}>
      {category.items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onPress={onProductPress}
        />
      ))}
    </View>
  </View>
));

// ─── Main Screen ───────────────────────────────────
export default function CategoryScreen(): React.JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const [catsRes, productsRes] = await Promise.all([
          fetchAllCategories(),
          fetchAllProducts(),
        ]);

        const cats = catsRes.data || catsRes;
        const products = productsRes.data || productsRes;

        // 🔥 Group products by category
        const grouped: Record<string, CategoryItem[]> = {};

        products.forEach((p: any) => {
          // ✅ Ignore products without category
          if (!p.category_id) return;

          const catId = p.category_id;

          if (!grouped[catId]) grouped[catId] = [];

          grouped[catId].push({
            id: p._id || p.zoho_item_id,
            item_id: p._id || p.zoho_item_id,
            name: p.name,
            image: getImageUrl(p),
          });
        });

        // ✅ Filter valid categories
        const validCategories = cats.filter(
          (c: any) => c.id && c.name
        );

        // 🔥 Map into UI structure
        const finalCategories: Category[] = validCategories
          .map((c: any) => {
  const items = grouped[c.id] || []; // ✅ FIX HERE

  return {
    id: c.id, // ✅ FIX HERE
    title: c.name,
    items: items.slice(0, 8),
    totalItems: items.length,
  };
})
          .filter((c) => c.totalItems > 0) // remove empty
          .sort((a, b) => b.totalItems - a.totalItems);

        if (mounted) setCategories(finalCategories);
      } catch (err) {
        console.warn("Category screen error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleProductPress = (item: CategoryItem) => {
    router.push(`/product/${item.item_id}` as any);
  };

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <ActivityIndicator
          style={{ marginTop: 50 }}
          size="large"
          color="#0F7B3C"
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            onProductPress={handleProductPress}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingHorizontal: 12 },

  section: { marginBottom: 4, paddingBottom: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAll: {
    fontSize: 12,
    color: "#196F1B",
    fontWeight: "600",
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { width: CARD_SIZE, alignItems: "center" },

  cardImageBox: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    backgroundColor: "#FFF8E7",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  cardImage: { width: CARD_SIZE - 8, height: CARD_SIZE - 8 },

  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF3CC",
  },

  cardLabel: {
    marginTop: 5,
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 2,
  },
});